import 'server-only';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { withTransaction, type Tx } from '@/db/tx';
import { items, loanItems, loans } from '@/db/schema';
import type { Actor } from '@/lib/auth-guard';
import { addDays, todayLjubljana } from '../dates';
import { checkRequest, computeAvailability, type RequestProblem } from './availability';
import { fetchOverlappingUsage } from './queries';
import type { ItemInput, LoanInput } from './validation';
import { nextStatus, type LoanAction } from './transitions';

/**
 * Single global write lock for the "no item is over-committed on any day" invariant.
 *
 * Why a lock at all: the invariant is an aggregate over a DATE RANGE. It is not
 * expressible as UNIQUE, not as CHECK (which sees one row), and not as an
 * EXCLUDE USING gist constraint (which can forbid overlaps but has no notion of a
 * quantity pool). So checking availability and then inserting is a genuine lost-update:
 * two powerusers both read "1 fridge free", both say yes, both insert - recreating in
 * software exactly the bug this app exists to fix. Read-committed will not stop it.
 *
 * Why GLOBAL rather than per-item: with three users, contention is effectively zero and
 * the lock is held for one round-trip. Per-item locks would have to be acquired in a
 * deterministic order to avoid deadlock between a "mize + klopi" and a "klopi + mize"
 * submission - real complexity for no payoff. A global lock also covers the
 * "cannot lower total_quantity below what is already committed" check for free.
 * The per-item upgrade path, if it is ever needed, is the two-argument form
 * pg_advisory_xact_lock(namespace, itemId).
 */
export const LOAN_LOCK_KEY = 918_273_645;

/**
 * MUST be the first statement in the transaction, and MUST be transaction-scoped.
 *
 * The Neon integration's DATABASE_URL is the PgBouncer-POOLED endpoint. Under
 * transaction pooling a server connection is handed to a different client the moment
 * the transaction commits, so a session-level `pg_advisory_lock` would be released
 * against a connection we no longer own and could leak into an unrelated session.
 * `pg_advisory_xact_lock` is released by the COMMIT/ROLLBACK itself, which is exactly
 * safe here. Never use the session-scoped variant in this codebase.
 */
async function lockLoans(tx: Tx): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(${LOAN_LOCK_KEY})`);
}

export type MutationResult<T = { id: number }> =
  | ({ ok: true } & T)
  | { ok: false; problems?: RequestProblem[]; message?: string };

/**
 * Re-check availability under the lock and write. Shared by create and edit.
 *
 * NOTE: every statement below uses `tx`, never the outer `getDb()`. Using the outer db
 * inside the callback would run on a DIFFERENT connection - outside the transaction and
 * outside the advisory lock - silently defeating the whole mechanism while every
 * non-concurrent test still passed.
 */
async function checkAvailabilityUnderLock(
  tx: Tx,
  input: LoanInput,
  excludeLoanId?: number,
): Promise<{ ok: true } | { ok: false; problems: RequestProblem[] }> {
  const itemIds = input.items.map((i) => i.itemId);

  const stock = await tx
    .select({ id: items.id, name: items.name, totalQuantity: items.totalQuantity, active: items.active })
    .from(items)
    .where(inArray(items.id, itemIds));

  const inactive = stock.filter((s) => !s.active);
  if (inactive.length > 0) {
    return {
      ok: false,
      problems: inactive.map((s) => ({
        kind: 'exceedsTotal' as const,
        itemId: s.id,
        itemName: `${s.name} (arhivirano)`,
        requested: input.items.find((i) => i.itemId === s.id)?.quantity ?? 0,
        total: 0,
      })),
    };
  }

  const usage = await fetchOverlappingUsage(tx, input.fromDate, input.toDate, {
    excludeLoanId,
    itemIds,
  });

  const availability = computeAvailability(stock, usage, input.fromDate, input.toDate);
  return checkRequest(input.items, availability);
}

export async function createLoan(input: LoanInput, actor: Actor): Promise<MutationResult> {
  return withTransaction(async (tx) => {
    await lockLoans(tx);

    const check = await checkAvailabilityUnderLock(tx, input);
    if (!check.ok) return { ok: false as const, problems: check.problems };

    const [loan] = await tx
      .insert(loans)
      .values({
        borrowerName: input.borrowerName,
        borrowerPhone: input.borrowerPhone,
        purpose: input.purpose,
        fromDate: input.fromDate,
        toDate: input.toDate,
        status: 'reserved',
        createdByEmail: actor.email,
        createdByName: actor.name,
      })
      .returning({ id: loans.id });

    await tx
      .insert(loanItems)
      .values(input.items.map((i) => ({ loanId: loan.id, itemId: i.itemId, quantity: i.quantity })));

    return { ok: true as const, id: loan.id };
  });
}

export async function updateLoan(
  id: number,
  input: LoanInput,
  actor: Actor,
): Promise<MutationResult> {
  return withTransaction(async (tx) => {
    await lockLoans(tx);

    const [existing] = await tx
      .select({ status: loans.status })
      .from(loans)
      .where(eq(loans.id, id))
      .limit(1);

    if (!existing) return { ok: false as const, message: 'Izposoja ne obstaja.' };
    if (existing.status === 'returned' || existing.status === 'cancelled') {
      return { ok: false as const, message: 'Zaključene izposoje ni več mogoče urejati.' };
    }

    // excludeLoanId so this loan does not conflict with itself when widening its range.
    const check = await checkAvailabilityUnderLock(tx, input, id);
    if (!check.ok) return { ok: false as const, problems: check.problems };

    await tx
      .update(loans)
      .set({
        borrowerName: input.borrowerName,
        borrowerPhone: input.borrowerPhone,
        purpose: input.purpose,
        fromDate: input.fromDate,
        toDate: input.toDate,
        updatedByEmail: actor.email,
        updatedAt: new Date(),
      })
      .where(eq(loans.id, id));

    await tx.delete(loanItems).where(eq(loanItems.loanId, id));
    await tx
      .insert(loanItems)
      .values(input.items.map((i) => ({ loanId: id, itemId: i.itemId, quantity: i.quantity })));

    return { ok: true as const, id };
  });
}

/**
 * Lifecycle transitions need no availability check, so no advisory lock - but they do
 * need to be race-free. A compare-and-swap `WHERE status = <expected>` makes them
 * idempotent: double-clicking "Označi kot predano" performs exactly one transition, and
 * two powerusers acting on the same loan get a clear message instead of a corrupt state.
 */
async function transition(
  id: number,
  action: LoanAction,
  expected: 'reserved' | 'out',
  patch: Record<string, unknown>,
): Promise<MutationResult<{ id: number }>> {
  const target = nextStatus(expected, action);
  if (!target) return { ok: false, message: 'Neveljaven prehod stanja.' };

  const result = await getDb()
    .update(loans)
    .set({ status: target, updatedAt: new Date(), ...patch })
    .where(and(eq(loans.id, id), eq(loans.status, expected)));

  if (result.rowCount !== 1) {
    return {
      ok: false,
      message: 'Stanje izposoje se je medtem spremenilo. Osvežite stran in poskusite znova.',
    };
  }
  return { ok: true, id };
}

export async function markHandedOver(id: number, actor: Actor) {
  return transition(id, 'predano', 'reserved', {
    handedOverAt: new Date(),
    handedOverByEmail: actor.email,
    updatedByEmail: actor.email,
  });
}

export async function markReturned(
  id: number,
  actor: Actor,
  opts: { conditionNote?: string; extendToToday?: boolean },
) {
  const patch: Record<string, unknown> = {
    returnedAt: new Date(),
    returnedByEmail: actor.email,
    returnConditionNote: opts.conditionNote?.trim() || null,
    updatedByEmail: actor.email,
  };
  if (opts.extendToToday) patch.toDate = todayLjubljana();

  return transition(id, 'vrnjeno', 'out', patch);
}

export async function cancelLoan(id: number, actor: Actor, reason?: string) {
  return transition(id, 'preklicano', 'reserved', {
    cancelledAt: new Date(),
    cancelledByEmail: actor.email,
    cancelReason: reason?.trim() || null,
    updatedByEmail: actor.email,
  });
}

export interface ItemSaveProblem {
  message: string;
}

/**
 * Lowering a total below what is already committed would quietly create an
 * over-committed state, so it is refused unless explicitly overridden. Reuses the same
 * pure availability engine as the booking path.
 */
export async function saveItem(
  input: ItemInput,
  opts: { id?: number; force?: boolean } = {},
): Promise<MutationResult<{ id: number }>> {
  return withTransaction(async (tx) => {
    await lockLoans(tx);

    if (opts.id !== undefined && !opts.force) {
      const danes = todayLjubljana();
      const horizon = addDays(danes, 730);
      const usage = await fetchOverlappingUsage(tx, danes, horizon, { itemIds: [opts.id] });
      const [availability] = computeAvailability(
        [{ id: opts.id, name: input.name, totalQuantity: input.totalQuantity }],
        usage,
        danes,
        horizon,
      );

      if (input.totalQuantity < availability.peak) {
        return {
          ok: false as const,
          message: `Znižanje na ${input.totalQuantity} ni mogoče: ${
            availability.peakDate ?? danes
          } je že rezerviranih ${availability.peak} kosov.`,
        };
      }
    }

    const values = {
      name: input.name,
      totalQuantity: input.totalQuantity,
      active: input.active,
      sortOrder: input.sortOrder,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    };

    if (opts.id === undefined) {
      const [row] = await tx.insert(items).values(values).returning({ id: items.id });
      return { ok: true as const, id: row.id };
    }

    await tx.update(items).set(values).where(eq(items.id, opts.id));
    return { ok: true as const, id: opts.id };
  });
}

export async function archiveItem(id: number) {
  await getDb().update(items).set({ active: false, updatedAt: new Date() }).where(eq(items.id, id));
  return { ok: true as const, id };
}

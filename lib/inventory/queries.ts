import 'server-only';
import { and, asc, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { items, loanItems, loans } from '@/db/schema';
import type { Tx } from '@/db/tx';
import type { IsoDate } from '../dates';
import { addDays, todayLjubljana } from '../dates';
import type { UsageRow } from './availability';
import { OCCUPYING_STATUSES, type LoanStatus } from './transitions';

type DbLike = ReturnType<typeof getDb> | Tx;

export interface ItemRow {
  id: number;
  name: string;
  totalQuantity: number;
  active: boolean;
  sortOrder: number;
  notes: string | null;
}

export async function fetchItems(
  dbLike: DbLike = getDb(),
  opts: { onlyActive?: boolean } = {},
): Promise<ItemRow[]> {
  const rows = await dbLike
    .select({
      id: items.id,
      name: items.name,
      totalQuantity: items.totalQuantity,
      active: items.active,
      sortOrder: items.sortOrder,
      notes: items.notes,
    })
    .from(items)
    .where(opts.onlyActive ? eq(items.active, true) : undefined)
    .orderBy(asc(items.sortOrder), asc(items.name));

  return rows;
}

/**
 * Every (loan x item) holding that overlaps [from, to] and still occupies equipment.
 *
 * Accepts a `db` OR a `tx`, so the same function serves the read-only screens and the
 * locked write path inside a transaction.
 *
 * `excludeLoanId` is what makes EDITING work: when re-checking loan #7, its own rows
 * must not conflict with themselves or you could never widen an existing booking.
 */
export async function fetchOverlappingUsage(
  dbLike: DbLike,
  from: IsoDate,
  to: IsoDate,
  opts: { excludeLoanId?: number; itemIds?: number[] } = {},
): Promise<UsageRow[]> {
  return dbLike
    .select({
      loanId: loanItems.loanId,
      itemId: loanItems.itemId,
      quantity: loanItems.quantity,
      fromDate: loans.fromDate,
      toDate: loans.toDate,
    })
    .from(loanItems)
    .innerJoin(loans, eq(loans.id, loanItems.loanId))
    .where(
      and(
        inArray(loans.status, [...OCCUPYING_STATUSES]),
        lte(loans.fromDate, to), // inclusive overlap: a.from <= b.to && a.to >= b.from
        gte(loans.toDate, from),
        opts.excludeLoanId ? ne(loans.id, opts.excludeLoanId) : undefined,
        opts.itemIds?.length ? inArray(loanItems.itemId, opts.itemIds) : undefined,
      ),
    );
}

export interface LoanListRow {
  id: number;
  borrowerName: string;
  borrowerPhone: string;
  purpose: string;
  fromDate: IsoDate;
  toDate: IsoDate;
  status: LoanStatus;
  oprema: { itemId: number; name: string; quantity: number }[];
}

async function attachItems(rows: Omit<LoanListRow, 'oprema'>[]): Promise<LoanListRow[]> {
  if (rows.length === 0) return [];

  const lines = await getDb()
    .select({
      loanId: loanItems.loanId,
      itemId: loanItems.itemId,
      quantity: loanItems.quantity,
      name: items.name,
    })
    .from(loanItems)
    .innerJoin(items, eq(items.id, loanItems.itemId))
    .where(
      inArray(
        loanItems.loanId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(items.sortOrder), asc(items.name));

  const byLoan = new Map<number, LoanListRow['oprema']>();
  for (const line of lines) {
    const list = byLoan.get(line.loanId) ?? [];
    list.push({ itemId: line.itemId, name: line.name, quantity: line.quantity });
    byLoan.set(line.loanId, list);
  }

  return rows.map((r) => ({ ...r, oprema: byLoan.get(r.id) ?? [] }));
}

const LOAN_COLUMNS = {
  id: loans.id,
  borrowerName: loans.borrowerName,
  borrowerPhone: loans.borrowerPhone,
  purpose: loans.purpose,
  fromDate: loans.fromDate,
  toDate: loans.toDate,
  status: loans.status,
};

export type LoanFilter = 'aktivne' | 'zamuja' | 'vrnjene' | 'preklicane' | 'vse';

export async function fetchLoans(
  filter: LoanFilter = 'aktivne',
  opts: { limit?: number; offset?: number } = {},
): Promise<LoanListRow[]> {
  const danes = todayLjubljana();

  const where =
    filter === 'aktivne'
      ? inArray(loans.status, [...OCCUPYING_STATUSES])
      : filter === 'zamuja'
        ? and(eq(loans.status, 'out'), sql`${loans.toDate} < ${danes}`)
        : filter === 'vrnjene'
          ? eq(loans.status, 'returned')
          : filter === 'preklicane'
            ? eq(loans.status, 'cancelled')
            : undefined;

  const rows = await getDb()
    .select(LOAN_COLUMNS)
    .from(loans)
    .where(where)
    .orderBy(desc(loans.fromDate), desc(loans.id))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);

  return attachItems(rows);
}

export interface LoanDetail extends LoanListRow {
  createdByEmail: string;
  createdByName: string | null;
  createdAt: Date;
  handedOverAt: Date | null;
  handedOverByEmail: string | null;
  returnedAt: Date | null;
  returnedByEmail: string | null;
  returnConditionNote: string | null;
  cancelledAt: Date | null;
  cancelledByEmail: string | null;
  cancelReason: string | null;
}

export async function fetchLoan(id: number): Promise<LoanDetail | null> {
  const [row] = await getDb()
    .select({
      ...LOAN_COLUMNS,
      createdByEmail: loans.createdByEmail,
      createdByName: loans.createdByName,
      createdAt: loans.createdAt,
      handedOverAt: loans.handedOverAt,
      handedOverByEmail: loans.handedOverByEmail,
      returnedAt: loans.returnedAt,
      returnedByEmail: loans.returnedByEmail,
      returnConditionNote: loans.returnConditionNote,
      cancelledAt: loans.cancelledAt,
      cancelledByEmail: loans.cancelledByEmail,
      cancelReason: loans.cancelReason,
    })
    .from(loans)
    .where(eq(loans.id, id))
    .limit(1);

  if (!row) return null;
  const [withItems] = await attachItems([row as Omit<LoanListRow, 'oprema'>]);
  return { ...row, oprema: withItems.oprema } as LoanDetail;
}

/** The dashboard, in one query per bucket over the same small active set. */
export async function fetchDashboard() {
  const danes = todayLjubljana();

  const active = await getDb()
    .select(LOAN_COLUMNS)
    .from(loans)
    .where(inArray(loans.status, [...OCCUPYING_STATUSES]))
    .orderBy(asc(loans.toDate), asc(loans.id));

  const withItems = await attachItems(active);

  return {
    danes,
    izposojeno: withItems.filter(
      (l) => l.status === 'out' && l.fromDate <= danes && danes <= l.toDate,
    ),
    zamuja: withItems.filter((l) => l.status === 'out' && l.toDate < danes),
    zaPrevzem: withItems.filter((l) => l.status === 'reserved' && l.fromDate <= danes),
    prihajajoce: withItems.filter(
      (l) => l.status === 'reserved' && l.fromDate > danes && l.fromDate <= addDays(danes, 7),
    ),
  };
}

/** Usage rows for the timeline, with borrower names for the cell tooltips. */
export async function fetchTimelineUsage(from: IsoDate, to: IsoDate) {
  const rows = await getDb()
    .select({
      loanId: loanItems.loanId,
      itemId: loanItems.itemId,
      quantity: loanItems.quantity,
      fromDate: loans.fromDate,
      toDate: loans.toDate,
      borrowerName: loans.borrowerName,
    })
    .from(loanItems)
    .innerJoin(loans, eq(loans.id, loanItems.loanId))
    .where(
      and(
        inArray(loans.status, [...OCCUPYING_STATUSES]),
        lte(loans.fromDate, to),
        gte(loans.toDate, from),
      ),
    );

  return rows;
}

export async function countLoans(filter: LoanFilter): Promise<number> {
  const danes = todayLjubljana();
  const where =
    filter === 'aktivne'
      ? inArray(loans.status, [...OCCUPYING_STATUSES])
      : filter === 'zamuja'
        ? and(eq(loans.status, 'out'), sql`${loans.toDate} < ${danes}`)
        : filter === 'vrnjene'
          ? eq(loans.status, 'returned')
          : filter === 'preklicane'
            ? eq(loans.status, 'cancelled')
            : undefined;

  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(loans)
    .where(where);
  return row?.n ?? 0;
}

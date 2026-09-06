import { config } from 'dotenv';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq, inArray, like } from 'drizzle-orm';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const HAS_DB = Boolean(process.env.DATABASE_URL);

/** Every row this suite creates carries this marker so cleanup is exact. */
const MARKER = '[TEST]';

describe.skipIf(!HAS_DB)('inventory writes against a real database', () => {
  type Mod = {
    createLoan: typeof import('@/lib/inventory/mutations').createLoan;
    updateLoan: typeof import('@/lib/inventory/mutations').updateLoan;
    markHandedOver: typeof import('@/lib/inventory/mutations').markHandedOver;
    markReturned: typeof import('@/lib/inventory/mutations').markReturned;
  };

  let mod: Mod;
  let db: typeof import('@/db/client').getDb extends () => infer R ? R : never;
  let schema: typeof import('@/db/schema');
  const actor = { email: 'test@example.com', name: 'Test Actor' };

  /** Item ids looked up by name so the test does not hardcode serial values. */
  const ids: Record<string, number> = {};

  beforeAll(async () => {
    mod = (await import('@/lib/inventory/mutations')) as unknown as Mod;
    schema = await import('@/db/schema');
    const { getDb } = await import('@/db/client');
    db = getDb();

    const rows = await db.select({ id: schema.items.id, name: schema.items.name }).from(schema.items);
    for (const r of rows) ids[r.name] = r.id;

    expect(ids['Hladilnik'], 'seed must have run').toBeDefined();
    expect(ids['Mize']).toBeDefined();
  });

  async function cleanup() {
    const created = await db
      .select({ id: schema.loans.id })
      .from(schema.loans)
      .where(like(schema.loans.purpose, `${MARKER}%`));

    if (created.length === 0) return;
    const loanIds = created.map((r) => r.id);
    await db.delete(schema.loanItems).where(inArray(schema.loanItems.loanId, loanIds));
    await db.delete(schema.loans).where(inArray(schema.loans.id, loanIds));
  }

  beforeAll(cleanup);
  afterAll(async () => {
    await cleanup();
    // Leave the brigade's database exactly as we found it.
    const leftovers = await db
      .select({ id: schema.loans.id })
      .from(schema.loans)
      .where(like(schema.loans.purpose, `${MARKER}%`));
    expect(leftovers, 'test rows must be cleaned up').toEqual([]);
  });

  function loan(over: Partial<Parameters<Mod['createLoan']>[0]> = {}) {
    return {
      borrowerName: 'Testni Izposojevalec',
      borrowerPhone: '041234567',
      purpose: `${MARKER} avtomatski test`,
      fromDate: '2099-09-19',
      toDate: '2099-09-21',
      items: [{ itemId: ids['Hladilnik'], quantity: 1 }],
      ...over,
    } as Parameters<Mod['createLoan']>[0];
  }

  it('creates a reservation', async () => {
    const res = await mod.createLoan(loan(), actor);
    expect(res.ok, JSON.stringify(res)).toBe(true);
  });

  // The original bug: both fridges promised to different people for the same dates.
  it('refuses an overlapping request that exceeds stock', async () => {
    const res = await mod.createLoan(
      loan({ fromDate: '2099-09-20', toDate: '2099-09-22', items: [{ itemId: ids['Hladilnik'], quantity: 2 }] }),
      actor,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.problems?.[0]).toMatchObject({ kind: 'conflict', itemName: 'Hladilnik' });
      // It must say WHICH day binds - that is the payoff of computing a peak.
      expect((res.problems![0] as { peakDate: string }).peakDate).toBe('2099-09-20');
    }
  });

  it('allows the second fridge for the overlapping period', async () => {
    const res = await mod.createLoan(
      loan({ fromDate: '2099-09-20', toDate: '2099-09-22', items: [{ itemId: ids['Hladilnik'], quantity: 1 }] }),
      actor,
    );
    expect(res.ok, JSON.stringify(res)).toBe(true);
  });

  it('refuses a third fridge once both are committed', async () => {
    const res = await mod.createLoan(
      loan({ fromDate: '2099-09-20', toDate: '2099-09-20', items: [{ itemId: ids['Hladilnik'], quantity: 1 }] }),
      actor,
    );
    expect(res.ok).toBe(false);
  });

  // The case a naive SUM implementation wrongly refuses, end to end.
  it('allows a request that spans two non-overlapping bookings', async () => {
    const a = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-03', items: [{ itemId: ids['Mize'], quantity: 20 }] }),
      actor,
    );
    const b = await mod.createLoan(
      loan({ fromDate: '2099-10-05', toDate: '2099-10-07', items: [{ itemId: ids['Mize'], quantity: 20 }] }),
      actor,
    );
    expect(a.ok && b.ok).toBe(true);

    // 20 out Oct 1-3 and 20 out Oct 5-7 of 30 total. Peak is 20, so 10 are free every
    // day across Oct 1-7. Summing would say 40 > 30 and refuse.
    const spanning = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-07', items: [{ itemId: ids['Mize'], quantity: 10 }] }),
      actor,
    );
    expect(spanning.ok, JSON.stringify(spanning)).toBe(true);

    const tooMany = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-07', items: [{ itemId: ids['Mize'], quantity: 11 }] }),
      actor,
    );
    expect(tooMany.ok).toBe(false);
  });

  it('lets a loan widen its own dates without conflicting with itself', async () => {
    const created = await mod.createLoan(
      loan({ fromDate: '2099-11-01', toDate: '2099-11-02', items: [{ itemId: ids['Žar'], quantity: 1 }] }),
      actor,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const widened = await mod.updateLoan(
      created.id,
      loan({ fromDate: '2099-11-01', toDate: '2099-11-10', items: [{ itemId: ids['Žar'], quantity: 1 }] }),
      actor,
    );
    expect(widened.ok, JSON.stringify(widened)).toBe(true);
  });

  // The whole point of the advisory lock. Also the only test that catches someone using
  // the outer `db` instead of `tx` inside the transaction.
  it('lets exactly one of two simultaneous requests take the last unit', async () => {
    const dates = { fromDate: '2099-12-01', toDate: '2099-12-02' };
    const single = { itemId: ids['Žar'], quantity: 1 }; // Žar has a total of 1

    const [first, second] = await Promise.all([
      mod.createLoan(loan({ ...dates, items: [single] }), actor),
      mod.createLoan(loan({ ...dates, items: [single] }), actor),
    ]);

    const succeeded = [first, second].filter((r) => r.ok).length;
    expect(succeeded, `expected exactly 1 success, got ${succeeded}`).toBe(1);
  });

  it('performs a lifecycle transition exactly once under a double submit', async () => {
    const created = await mod.createLoan(
      loan({ fromDate: '2099-12-20', toDate: '2099-12-21', items: [{ itemId: ids['Posoda za vodo'], quantity: 1 }] }),
      actor,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const [a, b] = await Promise.all([
      mod.markHandedOver(created.id, actor),
      mod.markHandedOver(created.id, actor),
    ]);
    expect([a.ok, b.ok].filter(Boolean).length).toBe(1);

    const returned = await mod.markReturned(created.id, actor, { conditionNote: 'Vse v redu.' });
    expect(returned.ok).toBe(true);

    const [row] = await db
      .select({ status: schema.loans.status, note: schema.loans.returnConditionNote })
      .from(schema.loans)
      .where(eq(schema.loans.id, created.id));
    expect(row.status).toBe('returned');
    expect(row.note).toBe('Vse v redu.');
  });

  it('frees the equipment again once returned', async () => {
    const created = await mod.createLoan(
      loan({ fromDate: '2099-12-20', toDate: '2099-12-21', items: [{ itemId: ids['Posoda za vodo'], quantity: 4 }] }),
      actor,
    );
    expect(created.ok, JSON.stringify(created)).toBe(true);
  });
});

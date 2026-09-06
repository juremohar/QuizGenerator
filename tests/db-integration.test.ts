import { config } from 'dotenv';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq, inArray, like } from 'drizzle-orm';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

/**
 * This suite WRITES to a real database, so it deliberately runs against
 * TEST_DATABASE_URL and never against DATABASE_URL. Pointing it at DATABASE_URL meant a
 * bare `npm test` created and deleted rows in the brigade's live data, and a cleanup
 * that failed halfway left them there.
 *
 * db/client.ts reads DATABASE_URL, so the test branch URL is assigned over it here,
 * before the dynamic import in beforeAll pulls that module in. Unset => the suite skips.
 */
const TEST_DB = process.env.TEST_DATABASE_URL;
if (TEST_DB) process.env.DATABASE_URL = TEST_DB;

const HAS_DB = Boolean(TEST_DB);

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

  /**
   * The suite owns its equipment instead of borrowing the brigade's.
   *
   * It used to look up the seed rows by name and assert on their stock levels, so
   * renaming "Hladilnik" to "Union hladilnik" in the UI - an entirely normal thing to
   * do - broke the build. The quantities below are not decoration: the scenarios need a
   * 2-stock item to test the second-then-third booking, a 1-stock item for the
   * last-unit race, and a 30-stock item for the peak-vs-sum case.
   */
  const FIXTURES = [
    { name: `${MARKER} Hladilnik`, totalQuantity: 2, sortOrder: 9010 },
    { name: `${MARKER} Mize`, totalQuantity: 30, sortOrder: 9020 },
    { name: `${MARKER} Žar`, totalQuantity: 1, sortOrder: 9030 },
    { name: `${MARKER} Posoda`, totalQuantity: 4, sortOrder: 9040 },
  ];

  const HLADILNIK = FIXTURES[0].name;
  const MIZE = FIXTURES[1].name;
  const ZAR = FIXTURES[2].name;
  const POSODA = FIXTURES[3].name;

  /** Item ids looked up by name so the test does not hardcode serial values. */
  const ids: Record<string, number> = {};

  /** Loans first: loan_items carries a foreign key to items. */
  async function cleanup() {
    const created = await db
      .select({ id: schema.loans.id })
      .from(schema.loans)
      .where(like(schema.loans.purpose, `${MARKER}%`));

    if (created.length > 0) {
      const loanIds = created.map((r) => r.id);
      await db.delete(schema.loanItems).where(inArray(schema.loanItems.loanId, loanIds));
      await db.delete(schema.loans).where(inArray(schema.loans.id, loanIds));
    }

    await db.delete(schema.items).where(like(schema.items.name, `${MARKER}%`));
  }

  beforeAll(async () => {
    mod = (await import('@/lib/inventory/mutations')) as unknown as Mod;
    schema = await import('@/db/schema');
    const { getDb } = await import('@/db/client');
    db = getDb();

    // A previous run that died mid-way would otherwise leave rows behind.
    await cleanup();

    const created = await db
      .insert(schema.items)
      .values(FIXTURES)
      .returning({ id: schema.items.id, name: schema.items.name });
    for (const r of created) ids[r.name] = r.id;

    expect(Object.keys(ids), 'fixtures must be created').toHaveLength(FIXTURES.length);
  });

  afterAll(async () => {
    await cleanup();
    // Leave the brigade's database exactly as we found it.
    const leftoverLoans = await db
      .select({ id: schema.loans.id })
      .from(schema.loans)
      .where(like(schema.loans.purpose, `${MARKER}%`));
    const leftoverItems = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .where(like(schema.items.name, `${MARKER}%`));
    expect(leftoverLoans, 'test loans must be cleaned up').toEqual([]);
    expect(leftoverItems, 'test items must be cleaned up').toEqual([]);
  });

  function loan(over: Partial<Parameters<Mod['createLoan']>[0]> = {}) {
    return {
      borrowerName: 'Testni Izposojevalec',
      borrowerPhone: '041234567',
      purpose: `${MARKER} avtomatski test`,
      fromDate: '2099-09-19',
      toDate: '2099-09-21',
      items: [{ itemId: ids[HLADILNIK], quantity: 1 }],
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
      loan({ fromDate: '2099-09-20', toDate: '2099-09-22', items: [{ itemId: ids[HLADILNIK], quantity: 2 }] }),
      actor,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.problems?.[0]).toMatchObject({ kind: 'conflict', itemName: HLADILNIK });
      // It must say WHICH day binds - that is the payoff of computing a peak.
      expect((res.problems![0] as { peakDate: string }).peakDate).toBe('2099-09-20');
    }
  });

  it('allows the second fridge for the overlapping period', async () => {
    const res = await mod.createLoan(
      loan({ fromDate: '2099-09-20', toDate: '2099-09-22', items: [{ itemId: ids[HLADILNIK], quantity: 1 }] }),
      actor,
    );
    expect(res.ok, JSON.stringify(res)).toBe(true);
  });

  it('refuses a third fridge once both are committed', async () => {
    const res = await mod.createLoan(
      loan({ fromDate: '2099-09-20', toDate: '2099-09-20', items: [{ itemId: ids[HLADILNIK], quantity: 1 }] }),
      actor,
    );
    expect(res.ok).toBe(false);
  });

  // The case a naive SUM implementation wrongly refuses, end to end.
  it('allows a request that spans two non-overlapping bookings', async () => {
    const a = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-03', items: [{ itemId: ids[MIZE], quantity: 20 }] }),
      actor,
    );
    const b = await mod.createLoan(
      loan({ fromDate: '2099-10-05', toDate: '2099-10-07', items: [{ itemId: ids[MIZE], quantity: 20 }] }),
      actor,
    );
    expect(a.ok && b.ok).toBe(true);

    // 20 out Oct 1-3 and 20 out Oct 5-7 of 30 total. Peak is 20, so 10 are free every
    // day across Oct 1-7. Summing would say 40 > 30 and refuse.
    const spanning = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-07', items: [{ itemId: ids[MIZE], quantity: 10 }] }),
      actor,
    );
    expect(spanning.ok, JSON.stringify(spanning)).toBe(true);

    const tooMany = await mod.createLoan(
      loan({ fromDate: '2099-10-01', toDate: '2099-10-07', items: [{ itemId: ids[MIZE], quantity: 11 }] }),
      actor,
    );
    expect(tooMany.ok).toBe(false);
  });

  it('lets a loan widen its own dates without conflicting with itself', async () => {
    const created = await mod.createLoan(
      loan({ fromDate: '2099-11-01', toDate: '2099-11-02', items: [{ itemId: ids[ZAR], quantity: 1 }] }),
      actor,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const widened = await mod.updateLoan(
      created.id,
      loan({ fromDate: '2099-11-01', toDate: '2099-11-10', items: [{ itemId: ids[ZAR], quantity: 1 }] }),
      actor,
    );
    expect(widened.ok, JSON.stringify(widened)).toBe(true);
  });

  // The whole point of the advisory lock. Also the only test that catches someone using
  // the outer `db` instead of `tx` inside the transaction.
  it('lets exactly one of two simultaneous requests take the last unit', async () => {
    const dates = { fromDate: '2099-12-01', toDate: '2099-12-02' };
    const single = { itemId: ids[ZAR], quantity: 1 }; // Žar has a total of 1

    const [first, second] = await Promise.all([
      mod.createLoan(loan({ ...dates, items: [single] }), actor),
      mod.createLoan(loan({ ...dates, items: [single] }), actor),
    ]);

    const succeeded = [first, second].filter((r) => r.ok).length;
    expect(succeeded, `expected exactly 1 success, got ${succeeded}`).toBe(1);
  });

  it('performs a lifecycle transition exactly once under a double submit', async () => {
    const created = await mod.createLoan(
      loan({ fromDate: '2099-12-20', toDate: '2099-12-21', items: [{ itemId: ids[POSODA], quantity: 1 }] }),
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
      loan({ fromDate: '2099-12-20', toDate: '2099-12-21', items: [{ itemId: ids[POSODA], quantity: 4 }] }),
      actor,
    );
    expect(created.ok, JSON.stringify(created)).toBe(true);
  });
});

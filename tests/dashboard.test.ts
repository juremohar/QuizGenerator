import { describe, expect, it } from 'vitest';

import { bucketDashboard, type BucketableLoan } from '@/lib/inventory/dashboard';

const DANES = '2026-09-06';

function loan(over: Partial<BucketableLoan> & { id: number }): BucketableLoan {
  return { status: 'reserved', fromDate: DANES, toDate: DANES, ...over };
}

describe('bucketDashboard', () => {
  it('shows equipment handed over early, before its booking starts', () => {
    // The regression: collected on the 6th for an event starting the 8th. It is out of
    // the store right now, so "trenutno izposojeno" is where it belongs.
    const early = loan({ id: 57, status: 'out', fromDate: '2026-09-08', toDate: '2026-09-11' });
    const b = bucketDashboard([early], DANES);

    expect(b.izposojeno.map((l) => l.id)).toEqual([57]);
    expect(b.zamuja).toEqual([]);
    expect(b.zaPrevzem).toEqual([]);
    expect(b.prihajajoce).toEqual([]);
  });

  it('puts every occupying loan in exactly one bucket', () => {
    const loans = [
      loan({ id: 1, status: 'out', fromDate: '2026-09-01', toDate: '2026-09-05' }), // late
      loan({ id: 2, status: 'out', fromDate: '2026-09-01', toDate: '2026-09-09' }), // out
      loan({ id: 3, status: 'out', fromDate: '2026-09-08', toDate: '2026-09-11' }), // out early
      loan({ id: 4, status: 'reserved', fromDate: '2026-09-06', toDate: '2026-09-07' }), // pickup
      loan({ id: 5, status: 'reserved', fromDate: '2026-09-20', toDate: '2026-09-21' }), // upcoming
    ];
    const b = bucketDashboard(loans, DANES);

    expect(b.zamuja.map((l) => l.id)).toEqual([1]);
    expect(b.izposojeno.map((l) => l.id)).toEqual([2, 3]);
    expect(b.zaPrevzem.map((l) => l.id)).toEqual([4]);
    expect(b.prihajajoce.map((l) => l.id)).toEqual([5]);

    const total = [b.zamuja, b.izposojeno, b.zaPrevzem, b.prihajajoce].flat().length;
    expect(total, 'no loan may be dropped or counted twice').toBe(loans.length);
  });

  it('counts a loan due today as still out, not late', () => {
    const b = bucketDashboard([loan({ id: 9, status: 'out', toDate: DANES })], DANES);
    expect(b.izposojeno.map((l) => l.id)).toEqual([9]);
    expect(b.zamuja).toEqual([]);
  });

  it('orders upcoming reservations by start date, not by return date', () => {
    const loans = [
      loan({ id: 1, fromDate: '2027-01-01', toDate: '2027-01-02' }),
      loan({ id: 2, fromDate: '2026-09-20', toDate: '2027-06-01' }), // ends much later
    ];
    expect(bucketDashboard(loans, DANES).prihajajoce.map((l) => l.id)).toEqual([2, 1]);
  });
});

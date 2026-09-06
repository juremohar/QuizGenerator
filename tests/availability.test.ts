import { describe, expect, it } from 'vitest';
import {
  checkRequest,
  computeAvailability,
  computePeakUsage,
  dailyUsage,
  type UsageRow,
} from '@/lib/inventory/availability';

const row = (loanId: number, quantity: number, fromDate: string, toDate: string): UsageRow => ({
  loanId,
  itemId: 1,
  quantity,
  fromDate,
  toDate,
});

const MIZE = [{ id: 1, name: 'Mize', totalQuantity: 30 }];

describe('computePeakUsage', () => {
  it('reports zero usage when nothing is booked', () => {
    const p = computePeakUsage([], '2026-09-01', '2026-09-07');
    expect(p).toEqual({ peak: 0, peakDate: null, contributingLoanIds: [] });
  });

  // The case a naive SUM over overlapping loans gets wrong.
  it('uses peak concurrent usage, not the sum of overlapping loans', () => {
    const rows = [row(1, 20, '2026-09-01', '2026-09-03'), row(2, 20, '2026-09-05', '2026-09-07')];
    const p = computePeakUsage(rows, '2026-09-01', '2026-09-07');
    expect(p.peak).toBe(20); // a SUM would say 40

    const [a] = computeAvailability(MIZE, rows, '2026-09-01', '2026-09-07');
    expect(a.available).toBe(10);
    expect(checkRequest([{ itemId: 1, quantity: 10 }], [a]).ok).toBe(true);
    expect(checkRequest([{ itemId: 1, quantity: 11 }], [a]).ok).toBe(false);
  });

  it('sums loans that genuinely overlap', () => {
    const rows = [row(1, 20, '2026-09-01', '2026-09-05'), row(2, 20, '2026-09-03', '2026-09-07')];
    const p = computePeakUsage(rows, '2026-09-01', '2026-09-07');
    expect(p.peak).toBe(40);
    expect(p.peakDate).toBe('2026-09-03');
    expect(p.contributingLoanIds).toEqual([1, 2]);

    const [a] = computeAvailability(MIZE, rows, '2026-09-01', '2026-09-07');
    expect(a.available).toBe(0);
  });

  it('ignores rows that fall entirely outside the window', () => {
    const p = computePeakUsage([row(1, 20, '2026-09-01', '2026-09-03')], '2026-09-04', '2026-09-06');
    expect(p.peak).toBe(0);
  });

  it('treats both range ends as occupied', () => {
    const rows = [row(1, 4, '2026-09-01', '2026-09-03')];
    expect(computePeakUsage(rows, '2026-09-03', '2026-09-05').peak).toBe(4); // touches toDate
    expect(computePeakUsage(rows, '2026-09-04', '2026-09-05').peak).toBe(0); // adjacent, clean
    expect(computePeakUsage(rows, '2026-08-30', '2026-09-01').peak).toBe(4); // touches fromDate
  });

  it('handles a single-day loan', () => {
    const rows = [{ ...row(1, 4, '2026-09-10', '2026-09-10'), itemId: 2 }];
    const posoda = [{ id: 2, name: 'Posoda za vodo', totalQuantity: 4 }];
    expect(computeAvailability(posoda, rows, '2026-09-10', '2026-09-10')[0].available).toBe(0);
    expect(computeAvailability(posoda, rows, '2026-09-11', '2026-09-11')[0].available).toBe(4);
  });

  // Fails any implementation that only samples the window endpoints.
  it('finds a peak strictly inside the window', () => {
    const rows = [row(1, 10, '2026-08-25', '2026-09-30'), row(2, 15, '2026-09-15', '2026-09-16')];
    const p = computePeakUsage(rows, '2026-09-01', '2026-09-20');
    expect(p.peak).toBe(25);
    expect(p.peakDate).toBe('2026-09-15');
  });

  it('counts a loan that started before the window, at the window start', () => {
    const rows = [row(1, 25, '2026-08-25', '2026-09-20')];
    const p = computePeakUsage(rows, '2026-09-01', '2026-09-02');
    expect(p.peak).toBe(25);
    expect(p.peakDate).toBe('2026-09-01');
    expect(computeAvailability(MIZE, rows, '2026-09-01', '2026-09-02')[0].available).toBe(5);
  });

  it('clamps availability at zero when history is over-committed', () => {
    const rows = [row(1, 20, '2026-09-01', '2026-09-05'), row(2, 20, '2026-09-01', '2026-09-05')];
    const [a] = computeAvailability(MIZE, rows, '2026-09-01', '2026-09-05');
    expect(a.peak).toBe(40);
    expect(a.available).toBe(0);
  });

  it('reports exactly the loans occupying the peak day, deduped and ascending', () => {
    const rows = [
      row(3, 5, '2026-09-01', '2026-09-10'),
      row(1, 5, '2026-09-05', '2026-09-06'),
      { ...row(1, 5, '2026-09-05', '2026-09-06'), itemId: 1 },
    ];
    const p = computePeakUsage(rows, '2026-09-01', '2026-09-10');
    expect(p.contributingLoanIds).toEqual([1, 3]);
  });

  it('rejects an inverted range', () => {
    expect(() => computePeakUsage([], '2026-09-07', '2026-09-01')).toThrow();
  });

  it('stays fast with thousands of rows over a year', () => {
    const rows: UsageRow[] = [];
    for (let i = 0; i < 5000; i++) {
      const day = String((i % 28) + 1).padStart(2, '0');
      const month = String((i % 12) + 1).padStart(2, '0');
      rows.push(row(i, 1, `2026-${month}-${day}`, `2026-${month}-${day}`));
    }
    const started = performance.now();
    computePeakUsage(rows, '2026-01-01', '2026-12-31');
    expect(performance.now() - started).toBeLessThan(200);
  });
});

describe('computeAvailability', () => {
  it('treats items independently and gives untouched items their full total', () => {
    const items = [
      { id: 1, name: 'Mize', totalQuantity: 30 },
      { id: 2, name: 'Klopi', totalQuantity: 60 },
    ];
    const rows: UsageRow[] = [
      { loanId: 1, itemId: 1, quantity: 12, fromDate: '2026-09-01', toDate: '2026-09-03' },
    ];
    const out = computeAvailability(items, rows, '2026-09-01', '2026-09-03');
    expect(out.find((a) => a.itemId === 1)!.available).toBe(18);
    expect(out.find((a) => a.itemId === 2)!.available).toBe(60);
  });
});

describe('checkRequest', () => {
  it('flags a request larger than the total stock', () => {
    const [a] = computeAvailability(MIZE, [], '2026-09-01', '2026-09-03');
    const res = checkRequest([{ itemId: 1, quantity: 40 }], [a]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.problems[0]).toMatchObject({ kind: 'exceedsTotal', total: 30 });
  });

  it('flags an unknown item', () => {
    const res = checkRequest([{ itemId: 99, quantity: 1 }], []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.problems[0]).toMatchObject({ kind: 'unknownItem', itemId: 99 });
  });
});

describe('dailyUsage', () => {
  it('projects usage per day across the window', () => {
    const rows = [row(1, 5, '2026-09-01', '2026-09-02'), row(2, 3, '2026-09-02', '2026-09-04')];
    expect(dailyUsage(rows, '2026-09-01', '2026-09-05').map((d) => d.used)).toEqual([5, 8, 3, 3, 0]);
  });
});

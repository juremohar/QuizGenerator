import type { IsoDate } from '../dates';
import { eachDay } from '../dates';

/**
 * One (loan x item) holding. `fromDate` and `toDate` are BOTH inclusive: a loan
 * 09-01..09-03 occupies the item on 1, 2 AND 3 September. Two ranges overlap iff
 * `a.from <= b.to && a.to >= b.from`, so 09-01..03 and 09-04..05 do not overlap.
 */
export interface UsageRow {
  readonly loanId: number;
  readonly itemId: number;
  readonly quantity: number;
  readonly fromDate: IsoDate;
  readonly toDate: IsoDate;
}

export interface PeakUsage {
  /** Max concurrent quantity held on any single day within [from, to]. */
  readonly peak: number;
  /** The earliest day the peak occurs. null iff peak === 0. */
  readonly peakDate: IsoDate | null;
  /** Loans occupying the item on peakDate, deduped, ascending. */
  readonly contributingLoanIds: readonly number[];
}

/**
 * Availability over a range is `total - peak concurrent usage`, NOT `total - sum of
 * overlapping quantities`.
 *
 * The requester needs the items for the ENTIRE interval, contiguously, so the binding
 * constraint is the worst single day - a max over days, not a sum over loans. Summing
 * is wrong and too conservative: with 30 tables, loan A holding 20 on Sep 1-3 and loan
 * B holding 20 on Sep 5-7, a request for 10 tables across Sep 1-7 is genuinely
 * satisfiable (usage is 20,20,20,0,20,20,20 - peak 20, so 10 free every single day),
 * but the sum is 40 > 30 and would refuse it. Refusing there is a real cost: the
 * brigade gets told "no" about equipment sitting in the garage.
 *
 * Usage is a step function that only rises at a loan's `fromDate` and only falls after
 * its `toDate`. So the max over [from, to] is attained either at `from` itself or at
 * some loan's `fromDate` inside the window - which makes this O(n^2) worst case in the
 * number of overlapping loans and O(n) in practice, never O(days).
 *
 * `rows` MUST already be filtered to a single item and to occupying statuses
 * ('reserved' and 'out'; 'returned' and 'cancelled' free the items).
 */
export function computePeakUsage(
  rows: readonly UsageRow[],
  from: IsoDate,
  to: IsoDate,
): PeakUsage {
  if (from > to) throw new Error(`Neveljavno obdobje: ${from} > ${to}`);

  // Clamp each row to the window. This is what makes `from` fall out as a candidate
  // automatically whenever a row spans it (a loan that started in August still counts
  // on 1 September).
  const clamped = rows
    .map((r) => ({
      loanId: r.loanId,
      quantity: r.quantity,
      start: r.fromDate < from ? from : r.fromDate,
      end: r.toDate > to ? to : r.toDate,
    }))
    .filter((r) => r.start <= r.end);

  if (clamped.length === 0) return { peak: 0, peakDate: null, contributingLoanIds: [] };

  // Candidate days: every clamped start. Between consecutive starts usage is
  // non-increasing, so no other day can hold the maximum.
  const candidates = Array.from(new Set(clamped.map((r) => r.start))).sort();

  let peak = 0;
  let peakDate: IsoDate | null = null;

  for (const day of candidates) {
    let used = 0;
    for (const r of clamped) {
      if (r.start <= day && day <= r.end) used += r.quantity;
    }
    if (used > peak) {
      peak = used;
      peakDate = day;
    }
  }

  const contributingLoanIds =
    peakDate === null
      ? []
      : Array.from(
          new Set(
            clamped.filter((r) => r.start <= peakDate! && peakDate! <= r.end).map((r) => r.loanId),
          ),
        ).sort((a, b) => a - b);

  return { peak, peakDate, contributingLoanIds };
}

/** Same, batched over many items. Items with no rows are absent from the Map. */
export function computePeakUsageByItem(
  rows: readonly UsageRow[],
  from: IsoDate,
  to: IsoDate,
): Map<number, PeakUsage> {
  const byItem = new Map<number, UsageRow[]>();
  for (const r of rows) {
    const list = byItem.get(r.itemId);
    if (list) list.push(r);
    else byItem.set(r.itemId, [r]);
  }

  const out = new Map<number, PeakUsage>();
  for (const [itemId, itemRows] of byItem) {
    out.set(itemId, computePeakUsage(itemRows, from, to));
  }
  return out;
}

export interface AvailabilityItem {
  readonly id: number;
  readonly name: string;
  readonly totalQuantity: number;
}

export interface AvailabilityResult {
  readonly itemId: number;
  readonly itemName: string;
  readonly total: number;
  readonly peak: number;
  /** total - peak, clamped at 0 so an over-committed history never reads negative. */
  readonly available: number;
  readonly peakDate: IsoDate | null;
  readonly conflictingLoanIds: readonly number[];
}

export function computeAvailability(
  items: readonly AvailabilityItem[],
  rows: readonly UsageRow[],
  from: IsoDate,
  to: IsoDate,
): AvailabilityResult[] {
  const peaks = computePeakUsageByItem(rows, from, to);

  return items.map((item) => {
    const p = peaks.get(item.id) ?? { peak: 0, peakDate: null, contributingLoanIds: [] };
    return {
      itemId: item.id,
      itemName: item.name,
      total: item.totalQuantity,
      peak: p.peak,
      available: Math.max(0, item.totalQuantity - p.peak),
      peakDate: p.peakDate,
      conflictingLoanIds: p.contributingLoanIds,
    };
  });
}

export interface RequestLine {
  readonly itemId: number;
  readonly quantity: number;
}

export type RequestProblem =
  | { kind: 'unknownItem'; itemId: number }
  | { kind: 'exceedsTotal'; itemId: number; itemName: string; requested: number; total: number }
  | {
      kind: 'conflict';
      itemId: number;
      itemName: string;
      requested: number;
      available: number;
      peakDate: IsoDate | null;
      conflictingLoanIds: readonly number[];
    };

export function checkRequest(
  requested: readonly RequestLine[],
  availability: readonly AvailabilityResult[],
): { ok: true } | { ok: false; problems: RequestProblem[] } {
  const byId = new Map(availability.map((a) => [a.itemId, a]));
  const problems: RequestProblem[] = [];

  for (const line of requested) {
    const a = byId.get(line.itemId);
    if (!a) {
      problems.push({ kind: 'unknownItem', itemId: line.itemId });
      continue;
    }
    if (line.quantity > a.total) {
      problems.push({
        kind: 'exceedsTotal',
        itemId: a.itemId,
        itemName: a.itemName,
        requested: line.quantity,
        total: a.total,
      });
      continue;
    }
    if (line.quantity > a.available) {
      problems.push({
        kind: 'conflict',
        itemId: a.itemId,
        itemName: a.itemName,
        requested: line.quantity,
        available: a.available,
        peakDate: a.peakDate,
        conflictingLoanIds: a.conflictingLoanIds,
      });
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
}

/** Timeline projection: one entry per day in [from, to], inclusive. */
export function dailyUsage(
  rows: readonly UsageRow[],
  from: IsoDate,
  to: IsoDate,
): { date: IsoDate; used: number; loanIds: number[] }[] {
  return eachDay(from, to).map((date) => {
    const active = rows.filter((r) => r.fromDate <= date && date <= r.toDate);
    return {
      date,
      used: active.reduce((sum, r) => sum + r.quantity, 0),
      loanIds: Array.from(new Set(active.map((r) => r.loanId))).sort((a, b) => a - b),
    };
  });
}

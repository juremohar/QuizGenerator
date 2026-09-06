import type { IsoDate } from '../dates';
import type { LoanStatus } from './transitions';

/** The slice of a loan the bucketing actually looks at. */
export interface BucketableLoan {
  readonly id: number;
  readonly status: LoanStatus;
  readonly fromDate: IsoDate;
  readonly toDate: IsoDate;
}

export interface DashboardBuckets<T extends BucketableLoan> {
  /** Physically handed over and not yet late. */
  readonly izposojeno: T[];
  /** Handed over and past its return date. */
  readonly zamuja: T[];
  /** Reserved and due to be collected today or earlier. */
  readonly zaPrevzem: T[];
  /** Reserved, starting later. */
  readonly prihajajoce: T[];
}

/**
 * Splits the occupying loans into the four dashboard lists.
 *
 * Pure and separate from the query so it can be tested without a database - which is the
 * whole reason the gap below went unnoticed.
 *
 * The invariant is that every reserved-or-out loan lands in EXACTLY ONE bucket:
 *
 *   out      -> toDate <  danes  =>  zamuja
 *               toDate >= danes  =>  izposojeno
 *   reserved -> fromDate <= danes =>  zaPrevzem
 *               fromDate >  danes =>  prihajajoce
 *
 * `izposojeno` deliberately does NOT require `fromDate <= danes`. Equipment marked
 * predano is in someone's van whatever the booking says, and a loan handed over early -
 * collected on the 6th for an event starting the 8th - used to satisfy no bucket at all
 * and disappear from the dashboard entirely while still counting against availability.
 */
export function bucketDashboard<T extends BucketableLoan>(
  loans: readonly T[],
  danes: IsoDate,
): DashboardBuckets<T> {
  const out = loans.filter((l) => l.status === 'out');
  const reserved = loans.filter((l) => l.status === 'reserved');

  return {
    zamuja: out.filter((l) => l.toDate < danes),
    izposojeno: out.filter((l) => l.toDate >= danes),
    zaPrevzem: reserved.filter((l) => l.fromDate <= danes),
    // Sorted by start date: the caller orders by `toDate`, which is what the overdue and
    // on-loan lists want but is wrong for "what is coming next".
    prihajajoce: reserved
      .filter((l) => l.fromDate > danes)
      .sort((a, b) => (a.fromDate === b.fromDate ? a.id - b.id : a.fromDate < b.fromDate ? -1 : 1)),
  };
}

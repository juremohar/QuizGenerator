import Link from 'next/link';

import { formatSl } from '@/lib/dates';
import type { AvailabilityResult } from '@/lib/inventory/availability';
import { badge, cx } from '@/lib/ui';
import { EmptyState } from './EmptyState';

/** Guarded because a 0-quantity row would otherwise render `width: NaN%`. */
function freeShare(row: AvailabilityResult): string {
  return row.total > 0 ? `${(row.available / row.total) * 100}%` : '0%';
}

/** Green when everything is free, amber when partly taken, red when nothing is left. */
function meterFill(row: AvailabilityResult): string {
  if (row.available === 0) return 'bg-red-500';
  if (row.available < row.total) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function badgeClass(row: AvailabilityResult): string {
  if (row.available === 0) return badge('red');
  if (row.available === row.total) return badge('emerald');
  return badge('amber');
}

function Meter({ row }: { row: AvailabilityResult }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
      <div className={cx('h-full rounded-full', meterFill(row))} style={{ width: freeShare(row) }} />
    </div>
  );
}

/**
 * The loans that collide on the range's worst day, with that day in brackets.
 *
 * `conflictingLoanIds` are only the loans occupying the item on `peakDate`, not every
 * overlapping loan, so naming the day is what makes the label true. That day is also the
 * one that caps `Prosto` (available = total - peak), which is what makes it worth
 * showing at all: it turns "no" into "no, because of the 15th".
 */
function Zasedajo({ row }: { row: AvailabilityResult }) {
  if (row.conflictingLoanIds.length === 0) return <span className="text-slate-300">–</span>;
  return (
    <span className="whitespace-nowrap">
      {row.conflictingLoanIds.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <Link href={`/inventar/izposoje/${id}`} className="text-blue-700 hover:underline">
            #{id}
          </Link>
        </span>
      ))}
      {row.peakDate && <span className="text-slate-400"> ({formatSl(row.peakDate)})</span>}
    </span>
  );
}

const TH = 'px-3 py-2 text-left text-xs font-medium tracking-wide text-slate-500 uppercase';
const TD = 'px-3 py-3 align-middle text-sm text-slate-700';

export function AvailabilityTable({ rows }: { rows: readonly AvailabilityResult[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState icon="bi-boxes" action={{ href: '/inventar/oprema/nova', label: 'Dodaj opremo' }}>
        Ni vnesene opreme.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <div key={row.itemId} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-900">{row.itemName}</span>
              <span className={badgeClass(row)}>
                {row.available} / {row.total} prosto
              </span>
            </div>

            {/* The bar answers "is this tight?" before anyone reads a single number. */}
            <Meter row={row} />

            {row.peak > 0 && (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <dt className="text-slate-500">Zasedajo</dt>
                <dd>
                  <Zasedajo row={row} />
                </dd>
              </dl>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto max-md:hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className={TH}>
                Oprema
              </th>
              <th scope="col" className={cx(TH, 'text-right')}>
                Prosto
              </th>
              <th scope="col" className={cx(TH, 'text-right')}>
                Skupaj
              </th>
              <th scope="col" className={TH}>
                Zasedajo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.itemId} className="hover:bg-slate-50">
                <td className={cx(TD, 'w-1/2')}>
                  <div className="font-medium text-slate-900">{row.itemName}</div>
                  <Meter row={row} />
                </td>
                <td className={cx(TD, 'text-right')}>
                  <span className={badgeClass(row)}>{row.available}</span>
                </td>
                <td className={cx(TD, 'text-right text-slate-400')}>{row.total}</td>
                <td className={TD}>
                  <Zasedajo row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

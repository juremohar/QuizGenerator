import Link from 'next/link';

import { formatSl } from '@/lib/dates';
import type { AvailabilityResult } from '@/lib/inventory/availability';
import { EmptyState } from './EmptyState';

/** Guarded because a 0-quantity row would otherwise render `width: NaN%`. */
function freeShare(row: AvailabilityResult): string {
  return row.total > 0 ? `${(row.available / row.total) * 100}%` : '0%';
}

/** Green when everything is free, amber when partly taken, red when nothing is left. */
function meterClass(row: AvailabilityResult): string {
  if (row.available === 0) return 'inv-meter inv-meter-full';
  if (row.available < row.total) return 'inv-meter inv-meter-part';
  return 'inv-meter';
}

function badgeClass(row: AvailabilityResult): string {
  if (row.available === 0) return 'bg-danger';
  if (row.available === row.total) return 'bg-success';
  return 'bg-warning text-dark';
}

function ConflictLinks({ ids }: { ids: readonly number[] }) {
  if (ids.length === 0) return <span className="text-secondary">–</span>;
  return (
    <>
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <Link href={`/inventar/izposoje/${id}`}>#{id}</Link>
        </span>
      ))}
    </>
  );
}

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
      <div className="d-md-none">
        {rows.map((row) => (
          <div className="inv-card" key={row.itemId}>
            <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
              <span className="fw-semibold">{row.itemName}</span>
              <span className={`badge ${badgeClass(row)}`}>
                {row.available} / {row.total} prosto
              </span>
            </div>

            {/* The bar answers "is this tight?" before anyone reads a single number. */}
            <div className={meterClass(row)} aria-hidden="true">
              <span style={{ width: freeShare(row) }} />
            </div>

            {row.peak > 0 && (
              <dl className="mt-2">
                <dt>Največ zasedenih</dt>
                <dd>
                  {row.peak}
                  {row.peakDate && ` (${formatSl(row.peakDate)})`}
                </dd>
                <dt>Zasedajo</dt>
                <dd>
                  <ConflictLinks ids={row.conflictingLoanIds} />
                </dd>
              </dl>
            )}
          </div>
        ))}
      </div>

      <div className="table-responsive d-none d-md-block">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">Oprema</th>
              <th scope="col" className="text-end">
                Skupaj
              </th>
              <th scope="col" className="text-end">
                Največ zasedenih
              </th>
              <th scope="col" className="text-end">
                Prosto
              </th>
              <th scope="col">Najbolj zaseden dan</th>
              <th scope="col">Zasedajo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.itemId}>
                <td>
                  <div>{row.itemName}</div>
                  <div className={meterClass(row)} aria-hidden="true">
                    <span style={{ width: freeShare(row) }} />
                  </div>
                </td>
                <td className="text-end">{row.total}</td>
                <td className="text-end">{row.peak}</td>
                <td className="text-end">
                  <span className={`badge ${badgeClass(row)}`}>{row.available}</span>
                </td>
                <td className="text-nowrap">
                  {row.peakDate ? (
                    formatSl(row.peakDate)
                  ) : (
                    <span className="text-secondary">–</span>
                  )}
                </td>
                <td>
                  <ConflictLinks ids={row.conflictingLoanIds} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

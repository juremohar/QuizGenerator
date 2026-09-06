import Link from 'next/link';

import { formatSl } from '@/lib/dates';
import type { AvailabilityResult } from '@/lib/inventory/availability';

export function AvailabilityTable({ rows }: { rows: readonly AvailabilityResult[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-secondary">
        Ni vnesene opreme. <Link href="/inventar/oprema/nova">Dodajte opremo</Link>.
      </p>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th scope="col">Oprema</th>
            <th scope="col" className="text-end">
              Skupaj
            </th>
            <th scope="col" className="text-end">
              Največ zasedeno
            </th>
            <th scope="col" className="text-end">
              Prosto
            </th>
            <th scope="col">Kritični dan</th>
            <th scope="col">Zasedajo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const badge =
              row.available === 0
                ? 'bg-danger'
                : row.available === row.total
                  ? 'bg-success'
                  : 'bg-warning text-dark';

            return (
              <tr key={row.itemId}>
                <td>{row.itemName}</td>
                <td className="text-end">{row.total}</td>
                <td className="text-end">{row.peak}</td>
                <td className="text-end">
                  <span className={`badge ${badge}`}>{row.available}</span>
                </td>
                <td className="text-nowrap">
                  {row.peakDate ? formatSl(row.peakDate) : <span className="text-secondary">–</span>}
                </td>
                <td>
                  {row.conflictingLoanIds.length === 0 ? (
                    <span className="text-secondary">–</span>
                  ) : (
                    row.conflictingLoanIds.map((id, i) => (
                      <span key={id}>
                        {i > 0 && ', '}
                        <Link href={`/inventar/izposoje/${id}`}>#{id}</Link>
                      </span>
                    ))
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

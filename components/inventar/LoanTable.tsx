import Link from 'next/link';

import { formatRangeSl } from '@/lib/dates';
import type { LoanListRow } from '@/lib/inventory/queries';
import { LoanStatusBadge } from './LoanStatusBadge';

interface Props {
  loans: readonly LoanListRow[];
  danes: string;
  /** Columns to leave out when the surrounding card already implies them. */
  hide?: ('status' | 'purpose')[];
  empty?: string;
}

export function opremaLabel(loan: LoanListRow): string {
  return loan.oprema.map((o) => `${o.name} ×${o.quantity}`).join(', ');
}

export function LoanTable({ loans, danes, hide = [], empty = 'Ni zapisov.' }: Props) {
  if (loans.length === 0) {
    return <p className="text-secondary mb-0">{empty}</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Izposojevalec</th>
            {!hide.includes('purpose') && <th scope="col">Dogodek</th>}
            <th scope="col">Obdobje</th>
            <th scope="col">Oprema</th>
            <th scope="col">Telefon</th>
            {!hide.includes('status') && <th scope="col">Stanje</th>}
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>
                <Link href={`/inventar/izposoje/${loan.id}`}>#{loan.id}</Link>
              </td>
              <td>{loan.borrowerName}</td>
              {!hide.includes('purpose') && <td>{loan.purpose}</td>}
              <td className="text-nowrap">{formatRangeSl(loan.fromDate, loan.toDate)}</td>
              <td>{opremaLabel(loan)}</td>
              <td className="text-nowrap">
                <a href={`tel:${loan.borrowerPhone.replace(/\s/g, '')}`}>{loan.borrowerPhone}</a>
              </td>
              {!hide.includes('status') && (
                <td>
                  <LoanStatusBadge status={loan.status} overdue={loan.toDate < danes} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

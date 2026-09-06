import Link from 'next/link';

import { daysInclusive, formatRangeSl } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import type { LoanListRow } from '@/lib/inventory/queries';
import { EmptyState } from './EmptyState';
import { LoanStatusBadge } from './LoanStatusBadge';
import { PhoneLink } from './PhoneLink';

interface Props {
  loans: readonly LoanListRow[];
  danes: string;
  /** Columns to leave out when the surrounding card already implies them. */
  hide?: ('status' | 'purpose')[];
  empty?: string;
  emptyIcon?: string;
  /** Rendered after each record - the action that belongs to this list, if any. */
  action?: (loan: LoanListRow) => React.ReactNode;
}

export function opremaLabel(loan: LoanListRow): string {
  return loan.oprema.map((o) => `${o.name} ×${o.quantity}`).join(', ');
}

function overdueDays(loan: LoanListRow, danes: string): number {
  return daysInclusive(loan.toDate, danes) - 1;
}

/**
 * A loan has seven attributes worth showing, which is three too many for a 390px table.
 * Below `md` each loan becomes a card; above it the table is still the faster scan.
 * Both branches render the same data, so nothing is hidden from a phone.
 */
export function LoanTable({
  loans,
  danes,
  hide = [],
  empty = 'Ni zapisov.',
  emptyIcon,
  action,
}: Props) {
  if (loans.length === 0) {
    return <EmptyState icon={emptyIcon}>{empty}</EmptyState>;
  }

  const showStatus = !hide.includes('status');
  const showPurpose = !hide.includes('purpose');

  return (
    <>
      <div className="d-md-none">
        {loans.map((loan) => {
          const overdue = loan.status === 'out' && loan.toDate < danes;
          return (
            <div className={`inv-card ${overdue ? 'inv-card-danger' : ''}`} key={loan.id}>
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <Link
                  className="fw-semibold text-decoration-none"
                  href={`/inventar/izposoje/${loan.id}`}
                >
                  {loan.borrowerName}
                  <span className="text-secondary fw-normal ms-1">#{loan.id}</span>
                </Link>
                <LoanStatusBadge status={loan.status} overdue={overdue} />
              </div>

              <dl>
                <dt>Obdobje</dt>
                <dd>
                  {formatRangeSl(loan.fromDate, loan.toDate)}
                  {overdue && (
                    <span className="text-danger fw-semibold ms-1">
                      (zamuja {stevilo(overdueDays(loan, danes), DAN)})
                    </span>
                  )}
                </dd>

                <dt>Oprema</dt>
                <dd>{opremaLabel(loan)}</dd>

                {showPurpose && (
                  <>
                    <dt>Dogodek</dt>
                    <dd>{loan.purpose}</dd>
                  </>
                )}

                <dt>Telefon</dt>
                <dd>
                  <PhoneLink phone={loan.borrowerPhone} />
                </dd>
              </dl>

              {action && <div className="mt-3 d-grid">{action(loan)}</div>}
            </div>
          );
        })}
      </div>

      <div className="table-responsive d-none d-md-block">
        <table className="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Izposojevalec</th>
              {showPurpose && <th scope="col">Dogodek</th>}
              <th scope="col">Obdobje</th>
              <th scope="col">Oprema</th>
              <th scope="col">Telefon</th>
              {showStatus && <th scope="col">Status</th>}
              {action && <th scope="col" />}
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const overdue = loan.status === 'out' && loan.toDate < danes;
              return (
                <tr key={loan.id}>
                  <td>
                    <Link href={`/inventar/izposoje/${loan.id}`}>#{loan.id}</Link>
                  </td>
                  <td>{loan.borrowerName}</td>
                  {showPurpose && <td>{loan.purpose}</td>}
                  <td className="text-nowrap">
                    {formatRangeSl(loan.fromDate, loan.toDate)}
                    {overdue && (
                      <div className="text-danger small fw-semibold">
                        zamuja {stevilo(overdueDays(loan, danes), DAN)}
                      </div>
                    )}
                  </td>
                  <td>{opremaLabel(loan)}</td>
                  <td>
                    <PhoneLink phone={loan.borrowerPhone} />
                  </td>
                  {showStatus && (
                    <td>
                      <LoanStatusBadge status={loan.status} overdue={overdue} />
                    </td>
                  )}
                  {action && <td className="text-end">{action(loan)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

import Link from 'next/link';

import { daysInclusive, formatRangeSl } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import type { LoanListRow } from '@/lib/inventory/queries';
import { cx } from '@/lib/ui';
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

const TH = 'px-3 py-2 text-left text-xs font-medium tracking-wide text-slate-500 uppercase';
const TD = 'px-3 py-3 align-middle text-sm text-slate-700';

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
      <div className="space-y-2 md:hidden">
        {loans.map((loan) => {
          const overdue = loan.status === 'out' && loan.toDate < danes;
          return (
            <div
              key={loan.id}
              className={cx(
                'rounded-xl border p-3',
                overdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white',
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <Link
                  href={`/inventar/izposoje/${loan.id}`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  {loan.borrowerName}
                  <span className="ml-1.5 font-normal text-slate-400">#{loan.id}</span>
                </Link>
                <LoanStatusBadge status={loan.status} overdue={overdue} />
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-slate-500">Obdobje</dt>
                <dd className="text-slate-700">
                  {formatRangeSl(loan.fromDate, loan.toDate)}
                  {overdue && (
                    <span className="ml-1 font-semibold text-red-700">
                      (zamuja {stevilo(overdueDays(loan, danes), DAN)})
                    </span>
                  )}
                </dd>

                <dt className="text-slate-500">Oprema</dt>
                <dd className="text-slate-700">{opremaLabel(loan)}</dd>

                {showPurpose && (
                  <>
                    <dt className="text-slate-500">Dogodek</dt>
                    <dd className="text-slate-700">{loan.purpose}</dd>
                  </>
                )}

                <dt className="text-slate-500">Telefon</dt>
                <dd>
                  <PhoneLink phone={loan.borrowerPhone} />
                </dd>
              </dl>

              {action && <div className="mt-3">{action(loan)}</div>}
            </div>
          );
        })}
      </div>

      <div className="-mx-4 overflow-x-auto max-md:hidden">
        <table className="w-full min-w-max border-collapse px-4">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className={TH}>
                #
              </th>
              <th scope="col" className={TH}>
                Izposojevalec
              </th>
              {showPurpose && (
                <th scope="col" className={TH}>
                  Dogodek
                </th>
              )}
              <th scope="col" className={TH}>
                Obdobje
              </th>
              <th scope="col" className={TH}>
                Oprema
              </th>
              <th scope="col" className={TH}>
                Telefon
              </th>
              {showStatus && (
                <th scope="col" className={TH}>
                  Status
                </th>
              )}
              {action && <th scope="col" className={TH} />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => {
              const overdue = loan.status === 'out' && loan.toDate < danes;
              return (
                <tr key={loan.id} className="hover:bg-slate-50">
                  <td className={cx(TD, 'pl-4')}>
                    <Link
                      href={`/inventar/izposoje/${loan.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      #{loan.id}
                    </Link>
                  </td>
                  <td className={cx(TD, 'font-medium text-slate-900')}>{loan.borrowerName}</td>
                  {showPurpose && <td className={TD}>{loan.purpose}</td>}
                  <td className={cx(TD, 'whitespace-nowrap')}>
                    {formatRangeSl(loan.fromDate, loan.toDate)}
                    {overdue && (
                      <div className="text-xs font-semibold text-red-700">
                        zamuja {stevilo(overdueDays(loan, danes), DAN)}
                      </div>
                    )}
                  </td>
                  <td className={TD}>{opremaLabel(loan)}</td>
                  <td className={TD}>
                    <PhoneLink phone={loan.borrowerPhone} />
                  </td>
                  {showStatus && (
                    <td className={TD}>
                      <LoanStatusBadge status={loan.status} overdue={overdue} />
                    </td>
                  )}
                  {action && <td className={cx(TD, 'pr-4 text-right')}>{action(loan)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { daysInclusive, formatRangeSl, formatSl, todayLjubljana } from '@/lib/dates';
import { fetchLoan } from '@/lib/inventory/queries';
import { LoanStatusBadge } from '@/components/inventar/LoanStatusBadge';
import { PredanoButton } from '@/components/inventar/PredanoButton';
import { ReturnForm } from '@/components/inventar/ReturnForm';
import { CancelForm } from '@/components/inventar/CancelForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

function formatDateTime(value: Date | null): string {
  if (!value) return '–';
  return new Intl.DateTimeFormat('sl-SI', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Ljubljana',
  }).format(value);
}

export default async function IzposojaPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const loan = await fetchLoan(id);
  if (!loan) notFound();

  const danes = todayLjubljana();
  const overdue = loan.status === 'out' && loan.toDate < danes;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h1 className="fs-3 mb-0">
          Izposoja #{loan.id} <LoanStatusBadge status={loan.status} overdue={overdue} />
        </h1>
        {(loan.status === 'reserved' || loan.status === 'out') && (
          <Link className="btn btn-outline-secondary" href={`/inventar/izposoje/${loan.id}/uredi`}>
            Uredi
          </Link>
        )}
      </div>

      <div className="row mt-4">
        <div className="col-lg-7">
          <dl className="row">
            <dt className="col-sm-4">Izposojevalec</dt>
            <dd className="col-sm-8">{loan.borrowerName}</dd>

            <dt className="col-sm-4">Telefon</dt>
            <dd className="col-sm-8">
              <a href={`tel:${loan.borrowerPhone.replace(/\s/g, '')}`}>{loan.borrowerPhone}</a>
            </dd>

            <dt className="col-sm-4">Dogodek / namen</dt>
            <dd className="col-sm-8" style={{ whiteSpace: 'pre-wrap' }}>
              {loan.purpose}
            </dd>

            <dt className="col-sm-4">Obdobje</dt>
            <dd className="col-sm-8">
              {formatRangeSl(loan.fromDate, loan.toDate)}{' '}
              <span className="text-secondary">
                ({daysInclusive(loan.fromDate, loan.toDate)} dni)
              </span>
              {overdue && (
                <span className="text-danger fw-bold ms-2">
                  zamuja {daysInclusive(loan.toDate, danes) - 1} dni
                </span>
              )}
            </dd>
          </dl>

          <table className="table table-sm">
            <thead>
              <tr>
                <th scope="col">Oprema</th>
                <th scope="col" className="text-end">
                  Kosov
                </th>
              </tr>
            </thead>
            <tbody>
              {loan.oprema.map((o) => (
                <tr key={o.itemId}>
                  <td>{o.name}</td>
                  <td className="text-end">{o.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {loan.returnConditionNote && (
            <div className="callout callout-warning">
              <strong>Stanje ob vrnitvi</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{loan.returnConditionNote}</div>
            </div>
          )}

          {loan.cancelReason && (
            <div className="callout callout-default">
              <strong>Razlog preklica</strong>
              <div>{loan.cancelReason}</div>
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <div className="card mb-3">
            <div className="card-header">
              <strong>Dejanja</strong>
            </div>
            <div className="card-body">
              {loan.status === 'reserved' && (
                <>
                  <PredanoButton loanId={loan.id} className="btn btn-primary mb-3" />
                  <hr />
                  <CancelForm loanId={loan.id} />
                </>
              )}

              {loan.status === 'out' && (
                <>
                  <ReturnForm loanId={loan.id} overdue={overdue} />
                  <p className="text-secondary small mt-3 mb-0">
                    Če je vrnjen le del opreme, najprej{' '}
                    <Link href={`/inventar/izposoje/${loan.id}/uredi`}>uredite izposojo</Link>.
                  </p>
                </>
              )}

              {(loan.status === 'returned' || loan.status === 'cancelled') && (
                <p className="text-secondary mb-0">Izposoja je zaključena.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <strong>Zapisi</strong>
            </div>
            <div className="card-body small">
              <div>
                Ustvaril: {loan.createdByName ?? loan.createdByEmail} ({loan.createdByEmail}),{' '}
                {formatDateTime(loan.createdAt)}
              </div>
              {loan.handedOverAt && (
                <div>
                  Predal: {loan.handedOverByEmail}, {formatDateTime(loan.handedOverAt)}
                </div>
              )}
              {loan.returnedAt && (
                <div>
                  Vrnitev zabeležil: {loan.returnedByEmail}, {formatDateTime(loan.returnedAt)}
                </div>
              )}
              {loan.cancelledAt && (
                <div>
                  Preklical: {loan.cancelledByEmail}, {formatDateTime(loan.cancelledAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link className="link-secondary" href="/inventar/izposoje">
          ← Vse izposoje
        </Link>
      </div>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { daysInclusive, formatRangeSl, todayLjubljana } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { fetchLoan } from '@/lib/inventory/queries';
import { LoanStatusBadge } from '@/components/inventar/LoanStatusBadge';
import { PageHeader } from '@/components/inventar/PageHeader';
import { PhoneLink } from '@/components/inventar/PhoneLink';
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

function Zapis({ icon, label, who, when }: { icon: string; label: string; who: string; when: string }) {
  return (
    <li className="d-flex gap-2 mb-2">
      <i className={`bi ${icon} text-secondary`} aria-hidden="true" />
      <div>
        <div>{label}</div>
        <div className="text-secondary">
          {who} · {when}
        </div>
      </div>
    </li>
  );
}

export default async function IzposojaPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const loan = await fetchLoan(id);
  if (!loan) notFound();

  const danes = todayLjubljana();
  const overdue = loan.status === 'out' && loan.toDate < danes;
  const zakljucena = loan.status === 'returned' || loan.status === 'cancelled';

  return (
    <>
      <PageHeader
        back={{ href: '/inventar/izposoje', label: 'Vse izposoje' }}
        title={
          <>
            {loan.borrowerName}{' '}
            <span className="text-secondary fw-normal">#{loan.id}</span>{' '}
            <LoanStatusBadge status={loan.status} overdue={overdue} />
          </>
        }
        lead={
          <>
            {formatRangeSl(loan.fromDate, loan.toDate)} ·{' '}
            {stevilo(daysInclusive(loan.fromDate, loan.toDate), DAN)}
          </>
        }
      >
        {!zakljucena && (
          <Link
            className="btn btn-outline-secondary w-100 w-sm-auto"
            href={`/inventar/izposoje/${loan.id}/uredi`}
          >
            <i className="bi bi-pencil me-2" aria-hidden="true" />
            Uredi
          </Link>
        )}
      </PageHeader>

      {overdue && (
        <div className="alert alert-danger d-flex flex-wrap align-items-center gap-2" role="alert">
          <span>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            Oprema zamuja <strong>{stevilo(daysInclusive(loan.toDate, danes) - 1, DAN)}</strong>.
          </span>
          <PhoneLink phone={loan.borrowerPhone} className="alert-link ms-auto" />
        </div>
      )}

      <div className="row g-3">
        {/* Actions come first on a phone: the reason to open a loan at the fire station
            door is to hand the equipment over or take it back, not to read the record. */}
        <div className="col-lg-5 order-lg-2">
          {!zakljucena && (
            <div className="card shadow-sm mb-3">
              <div className="card-header">
                <strong>
                  <i className="bi bi-lightning-charge me-2" aria-hidden="true" />
                  Dejanja
                </strong>
              </div>
              <div className="card-body">
                {loan.status === 'reserved' && (
                  <>
                    <PredanoButton loanId={loan.id} className="btn btn-primary w-100" />
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
              </div>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-header">
              <strong>
                <i className="bi bi-clock-history me-2" aria-hidden="true" />
                Zgodovina
              </strong>
            </div>
            <div className="card-body small">
              <ul className="list-unstyled mb-0">
                <Zapis
                  icon="bi-plus-circle"
                  label="Rezervacija ustvarjena"
                  who={loan.createdByName ?? loan.createdByEmail}
                  when={formatDateTime(loan.createdAt)}
                />
                {loan.handedOverAt && (
                  <Zapis
                    icon="bi-box-arrow-up"
                    label="Oprema predana"
                    who={loan.handedOverByEmail ?? '–'}
                    when={formatDateTime(loan.handedOverAt)}
                  />
                )}
                {loan.returnedAt && (
                  <Zapis
                    icon="bi-check-circle"
                    label="Oprema vrnjena"
                    who={loan.returnedByEmail ?? '–'}
                    when={formatDateTime(loan.returnedAt)}
                  />
                )}
                {loan.cancelledAt && (
                  <Zapis
                    icon="bi-x-circle"
                    label="Rezervacija preklicana"
                    who={loan.cancelledByEmail ?? '–'}
                    when={formatDateTime(loan.cancelledAt)}
                  />
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-7 order-lg-1">
          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <strong>
                <i className="bi bi-boxes me-2" aria-hidden="true" />
                Izposojena oprema
              </strong>
            </div>
            <ul className="list-group list-group-flush">
              {loan.oprema.map((o) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={o.itemId}
                >
                  {o.name}
                  <span className="badge bg-secondary">{o.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header">
              <strong>
                <i className="bi bi-info-circle me-2" aria-hidden="true" />
                Podatki
              </strong>
            </div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-sm-4">Izposojevalec</dt>
                <dd className="col-sm-8">{loan.borrowerName}</dd>

                <dt className="col-sm-4">Telefon</dt>
                <dd className="col-sm-8">
                  <PhoneLink phone={loan.borrowerPhone} />
                </dd>

                <dt className="col-sm-4">Dogodek / namen</dt>
                <dd className="col-sm-8 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {loan.purpose}
                </dd>
              </dl>
            </div>
          </div>

          {loan.returnConditionNote && (
            <div className="callout callout-warning mb-3">
              <strong>Stanje ob vrnitvi</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{loan.returnConditionNote}</div>
            </div>
          )}

          {loan.cancelReason && (
            <div className="callout callout-default mb-3">
              <strong>Razlog preklica</strong>
              <div>{loan.cancelReason}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

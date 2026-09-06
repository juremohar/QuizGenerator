import Link from 'next/link';
import { notFound } from 'next/navigation';

import { daysInclusive, formatRangeSl, todayLjubljana } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { fetchLoan } from '@/lib/inventory/queries';
import { btn, card, cardBody, cardHeader } from '@/lib/ui';
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

function Zapis({
  icon,
  label,
  who,
  when,
}: {
  icon: string;
  label: string;
  who: string;
  when: string;
}) {
  return (
    <li className="flex gap-3">
      <i className={`bi ${icon} mt-0.5 text-slate-400`} aria-hidden="true" />
      <div>
        <div className="text-slate-700">{label}</div>
        <div className="text-slate-400">
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
          <span className="flex flex-wrap items-center gap-2">
            {loan.borrowerName}
            <span className="font-normal text-slate-400">#{loan.id}</span>
            <LoanStatusBadge status={loan.status} overdue={overdue} />
          </span>
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
            className={btn('secondary', 'md', 'max-sm:w-full')}
            href={`/inventar/izposoje/${loan.id}/uredi`}
          >
            <i className="bi bi-pencil" aria-hidden="true" />
            Uredi
          </Link>
        )}
      </PageHeader>

      {overdue && (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <span className="flex items-center gap-2">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            Oprema zamuja{' '}
            <strong className="font-semibold">
              {stevilo(daysInclusive(loan.toDate, danes) - 1, DAN)}
            </strong>
            .
          </span>
          <PhoneLink phone={loan.borrowerPhone} className="ms-auto font-medium" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Actions come first on a phone: the reason to open a loan at the fire station
            door is to hand the equipment over or take it back, not to read the record. */}
        <div className="space-y-4 lg:order-2 lg:col-span-5">
          {!zakljucena && (
            <section className={card}>
              <div className={cardHeader}>
                <span className="flex items-center gap-2">
                  <i className="bi bi-lightning-charge text-slate-400" aria-hidden="true" />
                  Dejanja
                </span>
              </div>
              <div className={cardBody}>
                {loan.status === 'reserved' && (
                  <>
                    <PredanoButton loanId={loan.id} fullWidth />
                    <hr className="my-4 border-slate-200" />
                    <CancelForm loanId={loan.id} />
                  </>
                )}

                {loan.status === 'out' && (
                  <>
                    <ReturnForm loanId={loan.id} overdue={overdue} />
                    <p className="mt-3 text-sm text-slate-500">
                      Če je vrnjen le del opreme, najprej{' '}
                      <Link
                        href={`/inventar/izposoje/${loan.id}/uredi`}
                        className="text-blue-700 hover:underline"
                      >
                        uredite izposojo
                      </Link>
                      .
                    </p>
                  </>
                )}
              </div>
            </section>
          )}

          <section className={card}>
            <div className={cardHeader}>
              <span className="flex items-center gap-2">
                <i className="bi bi-clock-history text-slate-400" aria-hidden="true" />
                Zgodovina
              </span>
            </div>
            <div className={cardBody}>
              <ul className="space-y-3 text-sm">
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
          </section>
        </div>

        <div className="space-y-4 lg:order-1 lg:col-span-7">
          <section className={card}>
            <div className={cardHeader}>
              <span className="flex items-center gap-2">
                <i className="bi bi-boxes text-slate-400" aria-hidden="true" />
                Izposojena oprema
              </span>
            </div>
            <ul className="divide-y divide-slate-100">
              {loan.oprema.map((o) => (
                <li key={o.itemId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-slate-700">{o.name}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium tabular-nums text-slate-700">
                    {o.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <div className={cardHeader}>
              <span className="flex items-center gap-2">
                <i className="bi bi-info-circle text-slate-400" aria-hidden="true" />
                Podatki
              </span>
            </div>
            <div className={cardBody}>
              <dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-3 text-sm max-sm:grid-cols-1 max-sm:gap-y-1">
                <dt className="text-slate-500">Izposojevalec</dt>
                <dd className="text-slate-700 max-sm:mb-2">{loan.borrowerName}</dd>

                <dt className="text-slate-500">Telefon</dt>
                <dd className="max-sm:mb-2">
                  <PhoneLink phone={loan.borrowerPhone} />
                </dd>

                <dt className="text-slate-500">Dogodek / namen</dt>
                <dd className="whitespace-pre-wrap text-slate-700">{loan.purpose}</dd>
              </dl>
            </div>
          </section>

          {loan.returnConditionNote && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">Stanje ob vrnitvi</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
                {loan.returnConditionNote}
              </p>
            </div>
          )}

          {loan.cancelReason && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-700">Razlog preklica</p>
              <p className="mt-1 text-sm text-slate-600">{loan.cancelReason}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

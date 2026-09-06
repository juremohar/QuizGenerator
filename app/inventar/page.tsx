import Link from 'next/link';

import { fetchDashboard } from '@/lib/inventory/queries';
import { card, cardBody, cardHeader, cx } from '@/lib/ui';
import { LoanTable } from '@/components/inventar/LoanTable';
import { PageHeader } from '@/components/inventar/PageHeader';
import { PredanoButton } from '@/components/inventar/PredanoButton';

export const dynamic = 'force-dynamic';

type Tone = 'danger' | 'warning' | 'primary' | 'success';

const STAT_TONE: Record<Tone, { bar: string; value: string }> = {
  danger: { bar: 'bg-red-500', value: 'text-red-600' },
  warning: { bar: 'bg-amber-500', value: 'text-slate-900' },
  primary: { bar: 'bg-blue-500', value: 'text-slate-900' },
  success: { bar: 'bg-emerald-500', value: 'text-slate-900' },
};

/** A count nobody can act on is decoration, so every tile links to the matching list. */
function Stat({
  value,
  label,
  href,
  tone,
  icon,
}: {
  value: number;
  label: string;
  href: string;
  tone: Tone;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <span className={cx('absolute inset-y-0 left-0 w-1', STAT_TONE[tone].bar)} aria-hidden="true" />
      <span className={cx('block text-3xl font-semibold tabular-nums', STAT_TONE[tone].value)}>
        {value}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <i className={`bi ${icon}`} aria-hidden="true" />
        {label}
      </span>
    </Link>
  );
}

function Section({
  id,
  title,
  icon,
  count,
  danger,
  children,
}: {
  id?: string;
  title: string;
  icon: string;
  count?: number;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cx(card, 'mb-4', danger && 'border-red-300')}>
      <div className={cx(cardHeader, danger && 'border-red-200 bg-red-50 text-red-900')}>
        <span className="flex items-center gap-2">
          <i className={`bi ${icon} ${danger ? 'text-red-500' : 'text-slate-400'}`} aria-hidden="true" />
          {title}
        </span>
        {count !== undefined && count > 0 && (
          <span
            className={cx(
              'rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
              danger ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600',
            )}
          >
            {count}
          </span>
        )}
      </div>
      <div className={cardBody}>{children}</div>
    </section>
  );
}

export default async function PregledPage() {
  const { danes, izposojeno, zamuja, zaPrevzem, prihajajoce } = await fetchDashboard();

  return (
    <>
      <PageHeader
        title="Pregled"
        action={{ href: '/inventar/izposoje/nova', label: 'Nova izposoja', icon: 'bi-plus-lg' }}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          value={zamuja.length}
          label="Zamuja"
          href="/inventar/izposoje?status=zamuja"
          tone="danger"
          icon="bi-exclamation-triangle"
        />
        <Stat
          value={zaPrevzem.length}
          label="Za prevzem danes"
          href="#prevzem"
          tone="warning"
          icon="bi-box-arrow-up"
        />
        <Stat
          value={izposojeno.length}
          label="Trenutno izposojeno"
          href="/inventar/izposoje?status=aktivne"
          tone="primary"
          icon="bi-box-arrow-right"
        />
        <Stat
          value={prihajajoce.length}
          label="Prihajajoče"
          href="#prihajajoce"
          tone="success"
          icon="bi-calendar3"
        />
      </div>

      {/* Only shown when something is actually late: an always-present empty red card
          trains people to ignore the colour. */}
      {zamuja.length > 0 && (
        <Section title="Zamuja" icon="bi-exclamation-triangle" count={zamuja.length} danger>
          <p className="mb-3 text-sm text-slate-500">
            Oprema, ki bi morala biti že vrnjena. Pokličite izposojevalca s tapom na številko.
          </p>
          <LoanTable loans={zamuja} danes={danes} hide={['status', 'purpose']} />
        </Section>
      )}

      <Section id="prevzem" title="Za prevzem danes" icon="bi-box-arrow-up" count={zaPrevzem.length}>
        <LoanTable
          loans={zaPrevzem}
          danes={danes}
          hide={['status']}
          empty="Danes ni rezervacij za prevzem."
          emptyIcon="bi-calendar-check"
          action={(loan) => <PredanoButton loanId={loan.id} />}
        />
      </Section>

      <Section title="Trenutno izposojeno" icon="bi-box-arrow-right" count={izposojeno.length}>
        <LoanTable
          loans={izposojeno}
          danes={danes}
          hide={['status']}
          empty="Trenutno ni nič izposojeno."
          emptyIcon="bi-boxes"
        />
      </Section>

      <Section
        id="prihajajoce"
        title="Prihajajoče rezervacije"
        icon="bi-calendar3"
        count={prihajajoce.length}
      >
        <LoanTable
          loans={prihajajoce}
          danes={danes}
          hide={['status']}
          empty="Ni prihodnjih rezervacij."
          emptyIcon="bi-calendar3"
        />
      </Section>
    </>
  );
}

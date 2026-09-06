import Link from 'next/link';

import { fetchDashboard } from '@/lib/inventory/queries';
import { LoanTable } from '@/components/inventar/LoanTable';
import { PageHeader } from '@/components/inventar/PageHeader';
import { PredanoButton } from '@/components/inventar/PredanoButton';

export const dynamic = 'force-dynamic';

interface StatProps {
  value: number;
  label: string;
  href: string;
  tone: 'danger' | 'warning' | 'primary' | 'success';
  icon: string;
}

/** A count nobody can act on is decoration, so every tile links to the matching list. */
function Stat({ value, label, href, tone, icon }: StatProps) {
  return (
    <div className="col-6 col-lg-3">
      <Link className={`inv-stat inv-stat-${tone}`} href={href}>
        <div className="inv-stat-value">{value}</div>
        <div className="inv-stat-label">
          <i className={`bi ${icon} me-1`} aria-hidden="true" />
          {label}
        </div>
      </Link>
    </div>
  );
}

function Section({
  id,
  title,
  icon,
  count,
  tone,
  children,
}: {
  id?: string;
  title: string;
  icon: string;
  count?: number;
  tone?: 'danger';
  children: React.ReactNode;
}) {
  return (
    <section className={`card shadow-sm mb-4 ${tone === 'danger' ? 'border-danger' : ''}`} id={id}>
      <div
        className={`card-header d-flex justify-content-between align-items-center ${
          tone === 'danger' ? 'bg-danger text-white' : ''
        }`}
      >
        <strong>
          <i className={`bi ${icon} me-2`} aria-hidden="true" />
          {title}
        </strong>
        {count !== undefined && count > 0 && (
          <span className={`badge ${tone === 'danger' ? 'bg-light text-danger' : 'bg-secondary'}`}>
            {count}
          </span>
        )}
      </div>
      <div className="card-body">{children}</div>
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

      <div className="row g-2 g-md-3 mb-4">
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
          label="Prihajajoče (7 dni)"
          href="/inventar/koledar"
          tone="success"
          icon="bi-calendar3"
        />
      </div>

      {/* Only shown when something is actually late: an always-present empty red card
          trains people to ignore the colour. */}
      {zamuja.length > 0 && (
        <Section title="Zamuja" icon="bi-exclamation-triangle" count={zamuja.length} tone="danger">
          <p className="text-secondary small">
            Oprema, ki bi morala biti že vrnjena. Pokličite izposojevalca s tapom na številko.
          </p>
          <LoanTable loans={zamuja} danes={danes} hide={['status', 'purpose']} />
        </Section>
      )}

      <Section
        id="prevzem"
        title="Za prevzem danes"
        icon="bi-box-arrow-up"
        count={zaPrevzem.length}
      >
        <LoanTable
          loans={zaPrevzem}
          danes={danes}
          hide={['status']}
          empty="Danes ni rezervacij za prevzem."
          emptyIcon="bi-calendar-check"
          action={(loan) => <PredanoButton loanId={loan.id} />}
        />
      </Section>

      <Section
        title="Trenutno izposojeno"
        icon="bi-box-arrow-right"
        count={izposojeno.length}
      >
        <LoanTable
          loans={izposojeno}
          danes={danes}
          hide={['status']}
          empty="Trenutno ni nič izposojeno."
          emptyIcon="bi-boxes"
        />
      </Section>

      <Section title="Prihajajoče (7 dni)" icon="bi-calendar3" count={prihajajoce.length}>
        <LoanTable
          loans={prihajajoce}
          danes={danes}
          hide={['status']}
          empty="V naslednjih 7 dneh ni rezervacij."
          emptyIcon="bi-calendar3"
        />
      </Section>
    </>
  );
}

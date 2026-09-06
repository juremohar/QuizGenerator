import Link from 'next/link';

import { todayLjubljana } from '@/lib/dates';
import { fetchLoans, type LoanFilter } from '@/lib/inventory/queries';
import { LoanTable } from '@/components/inventar/LoanTable';
import { PageHeader } from '@/components/inventar/PageHeader';

export const dynamic = 'force-dynamic';

const FILTRI: { key: LoanFilter; label: string; empty: string }[] = [
  { key: 'aktivne', label: 'Aktivne', empty: 'Ni aktivnih izposoj.' },
  { key: 'zamuja', label: 'Zamuja', empty: 'Nič ne zamuja. Vsa oprema je vrnjena v roku.' },
  { key: 'vrnjene', label: 'Vrnjene', empty: 'Še ni vrnjenih izposoj.' },
  { key: 'preklicane', label: 'Preklicane', empty: 'Ni preklicanih rezervacij.' },
  { key: 'vse', label: 'Vse', empty: 'Ni še nobene izposoje.' },
];

const STRAN = 50;

type Props = { searchParams: Promise<{ status?: string; stran?: string }> };

export default async function IzposojePage({ searchParams }: Props) {
  const params = await searchParams;

  const izbrani = FILTRI.find((f) => f.key === params.status) ?? FILTRI[0];
  const filter = izbrani.key;
  const stran = Math.max(1, Number(params.stran ?? '1') || 1);

  const danes = todayLjubljana();
  const loans = await fetchLoans(filter, { limit: STRAN + 1, offset: (stran - 1) * STRAN });
  const hasNext = loans.length > STRAN;
  const vidne = loans.slice(0, STRAN);

  return (
    <>
      <PageHeader
        title="Izposoje"
        action={{ href: '/inventar/izposoje/nova', label: 'Nova izposoja', icon: 'bi-plus-lg' }}
      />

      {/* Plain server-rendered links: no client JS needed for filtering. The strip
          scrolls sideways on a phone rather than wrapping onto two ragged lines. */}
      <nav className="inv-tabs border-bottom mb-3 pb-1" aria-label="Filter izposoj">
        {FILTRI.map((f) => (
          <Link
            key={f.key}
            className={`btn btn-sm ${
              filter === f.key ? 'btn-secondary' : 'btn-outline-secondary'
            } flex-shrink-0`}
            href={`/inventar/izposoje?status=${f.key}`}
            aria-current={filter === f.key ? 'page' : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <LoanTable loans={vidne} danes={danes} empty={izbrani.empty} emptyIcon="bi-clipboard-x" />

      {(stran > 1 || hasNext) && (
        <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
          {stran > 1 ? (
            <Link
              className="btn btn-outline-secondary"
              href={`/inventar/izposoje?status=${filter}&stran=${stran - 1}`}
            >
              <i className="bi bi-arrow-left me-1" aria-hidden="true" />
              <span className="d-none d-sm-inline">Prejšnja</span>
            </Link>
          ) : (
            <span />
          )}

          <span className="text-secondary small">Stran {stran}</span>

          {hasNext ? (
            <Link
              className="btn btn-outline-secondary"
              href={`/inventar/izposoje?status=${filter}&stran=${stran + 1}`}
            >
              <span className="d-none d-sm-inline">Naslednja</span>
              <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}

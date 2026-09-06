import Link from 'next/link';

import { todayLjubljana } from '@/lib/dates';
import { fetchLoans, type LoanFilter } from '@/lib/inventory/queries';
import { btn, card, cardBody, cx } from '@/lib/ui';
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
      {/* Wraps rather than scrolls: five short labels fit two rows on a phone, and a
          second horizontally-scrolling strip under the nav clipped "Vse" off-screen. */}
      <nav aria-label="Filter izposoj" className="mb-4 flex flex-wrap gap-2">
        {FILTRI.map((f) => (
          <Link
            key={f.key}
            href={`/inventar/izposoje?status=${f.key}`}
            aria-current={filter === f.key ? 'page' : undefined}
            className={cx(
              'inline-flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors',
              filter === f.key
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className={card}>
        <div className={cardBody}>
          <LoanTable loans={vidne} danes={danes} empty={izbrani.empty} emptyIcon="bi-clipboard-x" />
        </div>
      </div>

      {(stran > 1 || hasNext) && (
        <div className="mt-4 flex items-center justify-between gap-2">
          {stran > 1 ? (
            <Link
              className={btn('secondary')}
              href={`/inventar/izposoje?status=${filter}&stran=${stran - 1}`}
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
              <span className="max-sm:hidden">Prejšnja</span>
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-slate-500">Stran {stran}</span>

          {hasNext ? (
            <Link
              className={btn('secondary')}
              href={`/inventar/izposoje?status=${filter}&stran=${stran + 1}`}
            >
              <span className="max-sm:hidden">Naslednja</span>
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}

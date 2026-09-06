import Link from 'next/link';

import { todayLjubljana } from '@/lib/dates';
import { fetchLoans, type LoanFilter } from '@/lib/inventory/queries';
import { LoanTable } from '@/components/inventar/LoanTable';

export const dynamic = 'force-dynamic';

const FILTRI: { key: LoanFilter; label: string }[] = [
  { key: 'aktivne', label: 'Aktivne' },
  { key: 'zamuja', label: 'Zamuja' },
  { key: 'vrnjene', label: 'Vrnjene' },
  { key: 'preklicane', label: 'Preklicane' },
  { key: 'vse', label: 'Vse' },
];

const STRAN = 50;

type Props = { searchParams: Promise<{ status?: string; stran?: string }> };

export default async function IzposojePage({ searchParams }: Props) {
  const params = await searchParams;

  const filter = (FILTRI.find((f) => f.key === params.status)?.key ?? 'aktivne') as LoanFilter;
  const stran = Math.max(1, Number(params.stran ?? '1') || 1);

  const danes = todayLjubljana();
  const loans = await fetchLoans(filter, { limit: STRAN + 1, offset: (stran - 1) * STRAN });
  const hasNext = loans.length > STRAN;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h1 className="fs-3 mb-0">Izposoje</h1>
        <Link className="btn btn-primary" href="/inventar/izposoje/nova">
          Nova izposoja
        </Link>
      </div>

      {/* Plain server-rendered links: no client JS needed for filtering. */}
      <ul className="nav nav-pills py-3">
        {FILTRI.map((f) => (
          <li className="nav-item" key={f.key}>
            <Link
              className={`nav-link ${filter === f.key ? 'active' : ''}`}
              href={`/inventar/izposoje?status=${f.key}`}
            >
              {f.label}
            </Link>
          </li>
        ))}
      </ul>

      <LoanTable loans={loans.slice(0, STRAN)} danes={danes} empty="Ni izposoj v tem pogledu." />

      <div className="d-flex justify-content-between mt-3">
        {stran > 1 ? (
          <Link
            className="btn btn-outline-secondary"
            href={`/inventar/izposoje?status=${filter}&stran=${stran - 1}`}
          >
            ← Prejšnja
          </Link>
        ) : (
          <span />
        )}
        {hasNext && (
          <Link
            className="btn btn-outline-secondary"
            href={`/inventar/izposoje?status=${filter}&stran=${stran + 1}`}
          >
            Naslednja →
          </Link>
        )}
      </div>
    </>
  );
}

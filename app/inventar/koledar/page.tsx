import Link from 'next/link';

import { addDays, formatRangeSl, isIsoDate, startOfWeek, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems, fetchTimelineUsage } from '@/lib/inventory/queries';
import { PageHeader } from '@/components/inventar/PageHeader';
import { TimelineGrid, TimelineLegend } from '@/components/inventar/TimelineGrid';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ od?: string; tedni?: string }> };

export default async function KoledarPage({ searchParams }: Props) {
  const params = await searchParams;
  const danes = todayLjubljana();

  const tedni = Math.min(12, Math.max(1, Number(params.tedni ?? '6') || 6));
  const from = startOfWeek(isIsoDate(params.od) ? params.od : danes);
  const to = addDays(from, tedni * 7 - 1);

  const oprema = await fetchItems(getDb(), { onlyActive: true });
  const rows = await fetchTimelineUsage(from, to);

  const prev = addDays(from, -tedni * 7);
  const next = addDays(from, tedni * 7);

  return (
    <>
      <PageHeader title="Koledar" lead="Zasedenost vse opreme po dnevih." />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div className="btn-group" role="group" aria-label="Premik obdobja">
          <Link
            className="btn btn-outline-secondary btn-sm"
            href={`/inventar/koledar?od=${prev}&tedni=${tedni}`}
          >
            <i className="bi bi-chevron-left" aria-hidden="true" />
            <span className="visually-hidden">Prejšnje obdobje</span>
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" href={`/inventar/koledar?tedni=${tedni}`}>
            Danes
          </Link>
          <Link
            className="btn btn-outline-secondary btn-sm"
            href={`/inventar/koledar?od=${next}&tedni=${tedni}`}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
            <span className="visually-hidden">Naslednje obdobje</span>
          </Link>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <span className="text-secondary small">Prikaži tednov:</span>
          <div className="btn-group" role="group" aria-label="Število prikazanih tednov">
            {[4, 6, 8, 12].map((n) => (
              <Link
                key={n}
                className={`btn btn-sm ${n === tedni ? 'btn-secondary' : 'btn-outline-secondary'}`}
                href={`/inventar/koledar?od=${from}&tedni=${n}`}
                aria-current={n === tedni ? 'true' : undefined}
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="text-secondary small mb-2">
        {formatRangeSl(from, to)}
        <span className="d-md-none">
          {' '}
          · <i className="bi bi-arrow-left-right" aria-hidden="true" /> tabelo povlecite vstran
        </span>
      </p>

      <TimelineGrid oprema={oprema} rows={rows} from={from} to={to} danes={danes} />

      <div className="mt-3">
        <TimelineLegend />
      </div>
    </>
  );
}

import Link from 'next/link';

import { addDays, formatRangeSl, isIsoDate, startOfWeek, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems, fetchTimelineUsage } from '@/lib/inventory/queries';
import { cx } from '@/lib/ui';
import { PageHeader } from '@/components/inventar/PageHeader';
import { TimelineGrid, TimelineLegend } from '@/components/inventar/TimelineGrid';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ od?: string; tedni?: string }> };

const SEG =
  'inline-flex min-h-9 items-center border border-slate-300 px-3 text-sm font-medium ' +
  'transition-colors first:rounded-l-lg last:rounded-r-lg not-last:border-r-0';

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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex" role="group" aria-label="Premik obdobja">
          <Link
            className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
            href={`/inventar/koledar?od=${prev}&tedni=${tedni}`}
          >
            <i className="bi bi-chevron-left" aria-hidden="true" />
            <span className="sr-only">Prejšnje obdobje</span>
          </Link>
          <Link
            className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
            href={`/inventar/koledar?tedni=${tedni}`}
          >
            Danes
          </Link>
          <Link
            className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
            href={`/inventar/koledar?od=${next}&tedni=${tedni}`}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
            <span className="sr-only">Naslednje obdobje</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Prikaži tednov:</span>
          <div className="flex" role="group" aria-label="Število prikazanih tednov">
            {[4, 6, 8, 12].map((n) => (
              <Link
                key={n}
                href={`/inventar/koledar?od=${from}&tedni=${n}`}
                aria-current={n === tedni ? 'true' : undefined}
                className={cx(
                  SEG,
                  n === tedni
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-2 text-sm text-slate-500">
        {formatRangeSl(from, to)}
        <span className="md:hidden">
          {' '}
          · <i className="bi bi-arrow-left-right" aria-hidden="true" /> tabelo povlecite vstran
        </span>
      </p>

      <TimelineGrid oprema={oprema} rows={rows} from={from} to={to} danes={danes} />

      <div className="mt-4">
        <TimelineLegend />
      </div>
    </>
  );
}

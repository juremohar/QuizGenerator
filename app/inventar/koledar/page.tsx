import Link from 'next/link';

import { addDays, formatRangeSl, isIsoDate, startOfWeek, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems, fetchTimelineUsage } from '@/lib/inventory/queries';
import { cx } from '@/lib/ui';
import { PageHeader } from '@/components/inventar/PageHeader';
import { TimelineGrid, TimelineLegend } from '@/components/inventar/TimelineGrid';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ od?: string }> };

/**
 * Fixed at four weeks. The selector that used to offer 4/6/8/12 cost a row of chrome to
 * answer a question nobody asks twice, and at 12 weeks the grid is unreadable anyway.
 */
const TEDNI = 4;

const SEG =
  'inline-flex min-h-9 items-center border border-slate-300 px-3 text-sm font-medium ' +
  'transition-colors first:rounded-l-lg last:rounded-r-lg not-last:border-r-0';

export default async function KoledarPage({ searchParams }: Props) {
  const params = await searchParams;
  const danes = todayLjubljana();

  const from = startOfWeek(isIsoDate(params.od) ? params.od : danes);
  const to = addDays(from, TEDNI * 7 - 1);

  const oprema = await fetchItems(getDb(), { onlyActive: true });
  const rows = await fetchTimelineUsage(from, to);

  const prev = addDays(from, -TEDNI * 7);
  const next = addDays(from, TEDNI * 7);

  return (
    <>
      <PageHeader title="Koledar" lead="Zasedenost vse opreme po dnevih." />

      <div className="mb-4 flex" role="group" aria-label="Premik obdobja">
        <Link
          className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
          href={`/inventar/koledar?od=${prev}`}
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
          <span className="sr-only">Prejšnje obdobje</span>
        </Link>
        <Link
          className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
          href="/inventar/koledar"
        >
          Danes
        </Link>
        <Link
          className={cx(SEG, 'bg-white text-slate-600 hover:bg-slate-50')}
          href={`/inventar/koledar?od=${next}`}
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <span className="sr-only">Naslednje obdobje</span>
        </Link>
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

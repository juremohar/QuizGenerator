import Link from 'next/link';

import { addDays, isIsoDate, startOfWeek, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems, fetchTimelineUsage } from '@/lib/inventory/queries';
import { TimelineGrid } from '@/components/inventar/TimelineGrid';

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
      <h1 className="fs-3">Koledar</h1>
      <p className="text-secondary">
        Zasedenost po dnevih. Prazno pomeni prosto, rumeno delno zasedeno, rdeče vse zasedeno.
      </p>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary btn-sm" href={`/inventar/koledar?od=${prev}&tedni=${tedni}`}>
            ← Prej
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" href={`/inventar/koledar?tedni=${tedni}`}>
            Danes
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" href={`/inventar/koledar?od=${next}&tedni=${tedni}`}>
            Naprej →
          </Link>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <span className="text-secondary small">Tednov:</span>
          {[4, 6, 8, 12].map((n) => (
            <Link
              key={n}
              className={`btn btn-sm ${n === tedni ? 'btn-secondary' : 'btn-outline-secondary'}`}
              href={`/inventar/koledar?od=${from}&tedni=${n}`}
            >
              {n}
            </Link>
          ))}
        </div>
      </div>

      <TimelineGrid oprema={oprema} rows={rows} from={from} to={to} danes={danes} />
    </>
  );
}

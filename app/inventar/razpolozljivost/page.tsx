import Link from 'next/link';

import { formatRangeSl, isIsoDate, todayLjubljana } from '@/lib/dates';
import { computeAvailability } from '@/lib/inventory/availability';
import { fetchItems, fetchOverlappingUsage } from '@/lib/inventory/queries';
import { getDb } from '@/db/client';
import { AvailabilityTable } from '@/components/inventar/AvailabilityTable';
import { DateRangeForm } from '@/components/inventar/DateRangeForm';
import { PageHeader } from '@/components/inventar/PageHeader';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ od?: string; do?: string }> };

export default async function RazpolozljivostPage({ searchParams }: Props) {
  const params = await searchParams;
  const danes = todayLjubljana();

  const od = isIsoDate(params.od) ? params.od : danes;
  const doDate = isIsoDate(params.do) && params.do >= od ? params.do : od;

  const oprema = await fetchItems(getDb(), { onlyActive: true });
  const usage = await fetchOverlappingUsage(getDb(), od, doDate);
  const availability = computeAvailability(oprema, usage, od, doDate);

  return (
    <>
      <PageHeader
        title="Razpoložljivost"
        lead={
          <>
            Koliko kosov je prostih <strong>vse dni izbranega obdobja</strong> – toliko jih
            lahko obljubite.
          </>
        }
      />

      <DateRangeForm od={od} do={doDate} danes={danes} action="/inventar/razpolozljivost" />

      <h2 className="fs-6 text-secondary mb-2">{formatRangeSl(od, doDate)}</h2>

      <AvailabilityTable rows={availability} />

      {availability.length > 0 && (
        <Link
          className="btn btn-primary w-100 w-sm-auto mt-3"
          href={`/inventar/izposoje/nova?od=${od}&do=${doDate}`}
        >
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Ustvari izposojo za to obdobje
        </Link>
      )}
    </>
  );
}

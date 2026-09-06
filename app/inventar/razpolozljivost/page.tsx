import Link from 'next/link';

import { isIsoDate, todayLjubljana } from '@/lib/dates';
import { computeAvailability } from '@/lib/inventory/availability';
import { fetchItems, fetchOverlappingUsage } from '@/lib/inventory/queries';
import { getDb } from '@/db/client';
import { AvailabilityTable } from '@/components/inventar/AvailabilityTable';
import { DateRangeForm } from '@/components/inventar/DateRangeForm';

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
      <h1 className="fs-3">Razpoložljivost opreme</h1>
      <p className="text-secondary">
        Izberite obdobje in preverite, koliko kosov je prostih <strong>v celotnem obdobju</strong>.
      </p>

      <DateRangeForm od={od} do={doDate} action="/inventar/razpolozljivost" />

      <AvailabilityTable rows={availability} />

      <Link className="btn btn-primary" href={`/inventar/izposoje/nova?od=${od}&do=${doDate}`}>
        Ustvari izposojo za to obdobje
      </Link>
    </>
  );
}

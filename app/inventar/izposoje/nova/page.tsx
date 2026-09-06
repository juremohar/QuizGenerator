import { isIsoDate, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { LoanForm } from '@/components/inventar/LoanForm';
import { ustvariIzposojo } from '@/app/inventar/actions';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ od?: string; do?: string }> };

export default async function NovaIzposojaPage({ searchParams }: Props) {
  const params = await searchParams;
  const danes = todayLjubljana();

  const od = isIsoDate(params.od) ? params.od : danes;
  const doDate = isIsoDate(params.do) && params.do >= od ? params.do : od;

  const oprema = await fetchItems(getDb(), { onlyActive: true });

  return (
    <>
      <h1 className="fs-3">Nova izposoja</h1>
      <p className="text-secondary">
        Razpoložljivost se preveri ob shranjevanju, za celotno izbrano obdobje.
      </p>

      <LoanForm
        action={ustvariIzposojo}
        oprema={oprema}
        cancelHref="/inventar"
        initial={{
          borrowerName: '',
          borrowerPhone: '',
          purpose: '',
          fromDate: od,
          toDate: doDate,
          lines: [{ itemId: '', quantity: 1 }],
        }}
      />
    </>
  );
}

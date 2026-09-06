import { isIsoDate, todayLjubljana } from '@/lib/dates';
import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { EmptyState } from '@/components/inventar/EmptyState';
import { LoanForm } from '@/components/inventar/LoanForm';
import { PageHeader } from '@/components/inventar/PageHeader';
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
      <PageHeader
        back={{ href: '/inventar', label: 'Pregled' }}
        title="Nova izposoja"
        lead="Razpoložljivost se preveri ob shranjevanju, za celotno izbrano obdobje."
      />

      {oprema.length === 0 ? (
        <EmptyState
          icon="bi-boxes"
          action={{ href: '/inventar/oprema/nova', label: 'Dodaj opremo' }}
        >
          Ni aktivne opreme, ki bi jo bilo mogoče izposoditi.
        </EmptyState>
      ) : (
        <LoanForm
          action={ustvariIzposojo}
          oprema={oprema}
          danes={danes}
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
      )}
    </>
  );
}

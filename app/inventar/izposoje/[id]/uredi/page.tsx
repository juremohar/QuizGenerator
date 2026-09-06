import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDb } from '@/db/client';
import { fetchItems, fetchLoan } from '@/lib/inventory/queries';
import { btn } from '@/lib/ui';
import { LoanForm } from '@/components/inventar/LoanForm';
import { PageHeader } from '@/components/inventar/PageHeader';
import { urediIzposojo } from '@/app/inventar/actions';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function UrediIzposojoPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const loan = await fetchLoan(id);
  if (!loan) notFound();

  if (loan.status === 'returned' || loan.status === 'cancelled') {
    return (
      <>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <i className="bi bi-lock" aria-hidden="true" />
          Zaključene izposoje ni več mogoče urejati.
        </div>
        <Link className={btn('secondary')} href={`/inventar/izposoje/${loan.id}`}>
          Nazaj na izposojo #{loan.id}
        </Link>
      </>
    );
  }

  // Include archived items too, so editing an old loan does not silently drop a line.
  const oprema = await fetchItems(getDb());

  return (
    <>
      <PageHeader
        back={{ href: `/inventar/izposoje/${loan.id}`, label: `Izposoja #${loan.id}` }}
        title={`Uredi izposojo #${loan.id}`}
        lead="Če je bil vrnjen le del opreme, tukaj popravite število kosov, nato potrdite vrnitev."
      />

      <LoanForm
        action={urediIzposojo}
        oprema={oprema}
        loanId={loan.id}
        submitLabel="Shrani spremembe"
        cancelHref={`/inventar/izposoje/${loan.id}`}
        initial={{
          borrowerName: loan.borrowerName,
          borrowerPhone: loan.borrowerPhone,
          purpose: loan.purpose,
          fromDate: loan.fromDate,
          toDate: loan.toDate,
          lines: loan.oprema.map((o) => ({ itemId: o.itemId, quantity: o.quantity })),
        }}
      />
    </>
  );
}

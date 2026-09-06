import { notFound } from 'next/navigation';

import { getDb } from '@/db/client';
import { fetchItems, fetchLoan } from '@/lib/inventory/queries';
import { LoanForm } from '@/components/inventar/LoanForm';
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
      <div className="alert alert-warning">Zaključene izposoje ni več mogoče urejati.</div>
    );
  }

  // Include archived items too, so editing an old loan does not silently drop a line.
  const oprema = await fetchItems(getDb());

  return (
    <>
      <h1 className="fs-3">Uredi izposojo #{loan.id}</h1>
      <p className="text-secondary">
        Če je bil vrnjen le del opreme, tukaj popravite število kosov, nato potrdite vrnitev.
      </p>

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

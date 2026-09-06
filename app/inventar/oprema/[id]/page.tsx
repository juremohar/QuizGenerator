import { notFound } from 'next/navigation';

import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { ItemForm } from '@/components/inventar/ItemForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function UrediOpremoPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const item = (await fetchItems(getDb())).find((i) => i.id === id);
  if (!item) notFound();

  return (
    <>
      <h1 className="fs-3">Uredi: {item.name}</h1>
      <ItemForm
        itemId={item.id}
        initial={{
          name: item.name,
          totalQuantity: item.totalQuantity,
          active: item.active,
          sortOrder: item.sortOrder,
          notes: item.notes ?? '',
        }}
      />
    </>
  );
}

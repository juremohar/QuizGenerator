import { notFound } from 'next/navigation';

import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { ItemForm } from '@/components/inventar/ItemForm';
import { PageHeader } from '@/components/inventar/PageHeader';

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
      <PageHeader back={{ href: '/inventar/oprema', label: 'Oprema' }} title={`Uredi: ${item.name}`} />
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

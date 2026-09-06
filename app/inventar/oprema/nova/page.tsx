import { ItemForm } from '@/components/inventar/ItemForm';
import { PageHeader } from '@/components/inventar/PageHeader';

export default function NovaOpremaPage() {
  return (
    <>
      <PageHeader
        back={{ href: '/inventar/oprema', label: 'Oprema' }}
        title="Dodaj opremo"
        lead="Vrsta opreme, ki si jo je mogoče izposoditi, in koliko kosov je na voljo."
      />
      <ItemForm />
    </>
  );
}

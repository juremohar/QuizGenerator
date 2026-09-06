import Link from 'next/link';

import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { KOS, stevilo } from '@/lib/sl';
import { badge, btn, card, cardBody, cx } from '@/lib/ui';
import { ArchiveButton } from '@/components/inventar/ArchiveButton';
import { EmptyState } from '@/components/inventar/EmptyState';
import { PageHeader } from '@/components/inventar/PageHeader';

export const dynamic = 'force-dynamic';

const TH = 'px-3 py-2 text-left text-xs font-medium tracking-wide text-slate-500 uppercase';
const TD = 'px-3 py-3 align-middle text-sm text-slate-700';

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className={badge('emerald')}>Aktivna</span>
  ) : (
    <span className={badge('slate')}>Arhivirana</span>
  );
}

export default async function OpremaPage() {
  const oprema = await fetchItems(getDb());
  const aktivne = oprema.filter((i) => i.active).length;

  return (
    <>
      <PageHeader
        title="Oprema"
        lead={
          oprema.length > 0
            ? `${aktivne} aktivnih od ${oprema.length} vpisanih vrst opreme.`
            : undefined
        }
        action={{ href: '/inventar/oprema/nova', label: 'Dodaj opremo', icon: 'bi-plus-lg' }}
      />

      {oprema.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="bi-boxes"
            action={{ href: '/inventar/oprema/nova', label: 'Dodaj opremo' }}
          >
            Ni vnesene opreme. Dodajte prvo vrsto opreme, da lahko začnete z izposojami.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="space-y-2 md:hidden">
            {oprema.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500">
                      {stevilo(item.totalQuantity, KOS)} skupaj
                    </div>
                  </div>
                  <StatusBadge active={item.active} />
                </div>

                {item.notes && <p className="mt-2 text-sm text-slate-500">{item.notes}</p>}

                <div className="mt-3 flex gap-2">
                  <Link className={btn('secondary', 'sm')} href={`/inventar/oprema/${item.id}`}>
                    Uredi
                  </Link>
                  {/* No delete: loan history references equipment, and the foreign key
                      enforces that. Retirement is archiving. */}
                  {item.active && <ArchiveButton itemId={item.id} itemName={item.name} />}
                </div>
              </div>
            ))}
          </div>

          <div className={cx(card, 'max-md:hidden')}>
            <div className={cx(cardBody, 'overflow-x-auto')}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className={TH}>
                      Oprema
                    </th>
                    <th scope="col" className={cx(TH, 'text-right')}>
                      Skupaj kosov
                    </th>
                    <th scope="col" className={TH}>
                      Status
                    </th>
                    <th scope="col" className={TH}>
                      Opombe
                    </th>
                    <th scope="col" className={TH} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oprema.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className={cx(TD, 'font-medium text-slate-900')}>{item.name}</td>
                      <td className={cx(TD, 'text-right tabular-nums')}>{item.totalQuantity}</td>
                      <td className={TD}>
                        <StatusBadge active={item.active} />
                      </td>
                      <td className={cx(TD, 'text-slate-500')}>{item.notes ?? ''}</td>
                      <td className={TD}>
                        <div className="flex justify-end gap-2">
                          <Link
                            className={btn('secondary', 'sm')}
                            href={`/inventar/oprema/${item.id}`}
                          >
                            Uredi
                          </Link>
                          {item.active && <ArchiveButton itemId={item.id} itemName={item.name} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

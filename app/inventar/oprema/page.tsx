import Link from 'next/link';

import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { KOS, stevilo } from '@/lib/sl';
import { ArchiveButton } from '@/components/inventar/ArchiveButton';
import { EmptyState } from '@/components/inventar/EmptyState';
import { PageHeader } from '@/components/inventar/PageHeader';

export const dynamic = 'force-dynamic';

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="badge bg-success">Aktivna</span>
  ) : (
    <span className="badge bg-secondary">Arhivirana</span>
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
        <EmptyState icon="bi-boxes" action={{ href: '/inventar/oprema/nova', label: 'Dodaj opremo' }}>
          Ni vnesene opreme. Dodajte prvo vrsto opreme, da lahko začnete z izposojami.
        </EmptyState>
      ) : (
        <>
          <div className="d-md-none">
            {oprema.map((item) => (
              <div className="inv-card" key={item.id}>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-secondary small">
                      {stevilo(item.totalQuantity, KOS)} skupaj
                    </div>
                  </div>
                  <StatusBadge active={item.active} />
                </div>

                {item.notes && <p className="text-secondary small mt-2 mb-0">{item.notes}</p>}

                <div className="d-flex gap-2 mt-3">
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    href={`/inventar/oprema/${item.id}`}
                  >
                    Uredi
                  </Link>
                  {/* No delete: loan history references equipment, and the foreign key
                      enforces that. Retirement is archiving. */}
                  {item.active && <ArchiveButton itemId={item.id} itemName={item.name} />}
                </div>
              </div>
            ))}
          </div>

          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th scope="col">Oprema</th>
                  <th scope="col" className="text-end">
                    Skupaj kosov
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">Opombe</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {oprema.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="text-end">{item.totalQuantity}</td>
                    <td>
                      <StatusBadge active={item.active} />
                    </td>
                    <td className="text-secondary small">{item.notes ?? ''}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <Link
                          className="btn btn-sm btn-outline-secondary"
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
        </>
      )}
    </>
  );
}

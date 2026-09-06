import Link from 'next/link';

import { getDb } from '@/db/client';
import { fetchItems } from '@/lib/inventory/queries';
import { arhivirajOpremo } from '@/app/inventar/actions';
import { SubmitButton } from '@/components/inventar/SubmitButton';

export const dynamic = 'force-dynamic';

export default async function OpremaPage() {
  const oprema = await fetchItems(getDb());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h1 className="fs-3 mb-0">Oprema</h1>
        <Link className="btn btn-primary" href="/inventar/oprema/nova">
          Dodaj opremo
        </Link>
      </div>

      <div className="table-responsive mt-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th scope="col">Oprema</th>
              <th scope="col" className="text-end">
                Skupaj kosov
              </th>
              <th scope="col">Stanje</th>
              <th scope="col">Opombe</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {oprema.length === 0 && (
              <tr>
                <td colSpan={5} className="text-secondary">
                  Ni vnesene opreme.
                </td>
              </tr>
            )}
            {oprema.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="text-end">{item.totalQuantity}</td>
                <td>
                  {item.active ? (
                    <span className="badge bg-success">Aktivna</span>
                  ) : (
                    <span className="badge bg-secondary">Arhivirana</span>
                  )}
                </td>
                <td className="text-secondary small">{item.notes ?? ''}</td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Link
                      className="btn btn-sm btn-outline-secondary"
                      href={`/inventar/oprema/${item.id}`}
                    >
                      Uredi
                    </Link>
                    {item.active && (
                      // No delete: loan history references equipment, and the foreign key
                      // enforces that. Retirement is archiving.
                      <form action={arhivirajOpremo}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <SubmitButton className="btn btn-sm btn-outline-danger">
                          Arhiviraj
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

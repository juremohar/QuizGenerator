import Link from 'next/link';

import { daysInclusive, formatRangeSl } from '@/lib/dates';
import { fetchDashboard } from '@/lib/inventory/queries';
import { LoanTable } from '@/components/inventar/LoanTable';
import { PredanoButton } from '@/components/inventar/PredanoButton';

export const dynamic = 'force-dynamic';

export default async function PregledPage() {
  const { danes, izposojeno, zamuja, zaPrevzem, prihajajoce } = await fetchDashboard();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="fs-3 mb-0">Pregled</h1>
        <Link className="btn btn-primary" href="/inventar/izposoje/nova">
          Nova izposoja
        </Link>
      </div>

      {zamuja.length > 0 && (
        <div className="card border-danger mb-4">
          <div className="card-header bg-danger text-white d-flex justify-content-between">
            <strong>Zamuja</strong>
            <span className="badge bg-light text-danger">{zamuja.length}</span>
          </div>
          <div className="card-body">
            <p className="text-secondary small">
              Oprema, ki bi morala biti že vrnjena. Telefonska številka je v tabeli.
            </p>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Izposojevalec</th>
                    <th scope="col">Telefon</th>
                    <th scope="col">Oprema</th>
                    <th scope="col">Rok</th>
                    <th scope="col">Zamuda</th>
                  </tr>
                </thead>
                <tbody>
                  {zamuja.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <Link href={`/inventar/izposoje/${loan.id}`}>#{loan.id}</Link>
                      </td>
                      <td>{loan.borrowerName}</td>
                      <td className="text-nowrap">
                        <a href={`tel:${loan.borrowerPhone.replace(/\s/g, '')}`}>
                          {loan.borrowerPhone}
                        </a>
                      </td>
                      <td>{loan.oprema.map((o) => `${o.name} ×${o.quantity}`).join(', ')}</td>
                      <td className="text-nowrap">{formatRangeSl(loan.fromDate, loan.toDate)}</td>
                      <td className="text-danger fw-bold text-nowrap">
                        {daysInclusive(loan.toDate, danes) - 1} dni
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">
          <strong>Za prevzem danes</strong>
        </div>
        <div className="card-body">
          {zaPrevzem.length === 0 ? (
            <p className="text-secondary mb-0">Danes ni rezervacij za prevzem.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Izposojevalec</th>
                    <th scope="col">Oprema</th>
                    <th scope="col">Obdobje</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {zaPrevzem.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <Link href={`/inventar/izposoje/${loan.id}`}>#{loan.id}</Link>
                      </td>
                      <td>{loan.borrowerName}</td>
                      <td>{loan.oprema.map((o) => `${o.name} ×${o.quantity}`).join(', ')}</td>
                      <td className="text-nowrap">{formatRangeSl(loan.fromDate, loan.toDate)}</td>
                      <td className="text-end">
                        <PredanoButton loanId={loan.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <strong>Trenutno izposojeno</strong>
        </div>
        <div className="card-body">
          <LoanTable
            loans={izposojeno}
            danes={danes}
            hide={['status']}
            empty="Trenutno ni nič izposojeno."
          />
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <strong>Prihajajoče (7 dni)</strong>
        </div>
        <div className="card-body">
          <LoanTable
            loans={prihajajoce}
            danes={danes}
            hide={['status']}
            empty="V naslednjih 7 dneh ni rezervacij."
          />
        </div>
      </div>
    </>
  );
}

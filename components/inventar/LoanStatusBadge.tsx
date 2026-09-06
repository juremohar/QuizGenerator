import { STATUS_BADGE, STATUS_LABEL, type LoanStatus } from '@/lib/inventory/transitions';

export function LoanStatusBadge({ status, overdue }: { status: LoanStatus; overdue?: boolean }) {
  if (overdue && status === 'out') {
    return <span className="badge bg-danger">Zamuja</span>;
  }
  return <span className={`badge ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>;
}

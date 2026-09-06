import { STATUS_LABEL, STATUS_TONE, type LoanStatus } from '@/lib/inventory/transitions';
import { badge, type BadgeTone } from '@/lib/ui';

export function LoanStatusBadge({ status, overdue }: { status: LoanStatus; overdue?: boolean }) {
  if (overdue && status === 'out') {
    return (
      <span className={badge('red')}>
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        Zamuja
      </span>
    );
  }
  return <span className={badge(STATUS_TONE[status] as BadgeTone)}>{STATUS_LABEL[status]}</span>;
}

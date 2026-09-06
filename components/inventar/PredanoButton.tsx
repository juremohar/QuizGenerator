import { oznaciPredano } from '@/app/inventar/actions';
import { SubmitButton } from './SubmitButton';

/**
 * `d-grid` on a phone stretches the button to the full card width - it is the one action
 * on that card - while `d-md-block` lets it sit at its natural size inside a table cell.
 */
export function PredanoButton({ loanId, className }: { loanId: number; className?: string }) {
  return (
    <form action={oznaciPredano} className="d-grid d-md-block">
      <input type="hidden" name="loanId" value={loanId} />
      <SubmitButton className={className ?? 'btn btn-sm btn-primary'} pendingLabel="Shranjujem …">
        <i className="bi bi-box-arrow-up me-2" aria-hidden="true" />
        Označi kot predano
      </SubmitButton>
    </form>
  );
}

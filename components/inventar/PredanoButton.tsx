import { oznaciPredano } from '@/app/inventar/actions';
import { SubmitButton } from './SubmitButton';

/**
 * Full width on a phone - it is the only action on that card - and natural width inside
 * a table cell on a desktop.
 */
export function PredanoButton({ loanId, fullWidth }: { loanId: number; fullWidth?: boolean }) {
  return (
    <form action={oznaciPredano}>
      <input type="hidden" name="loanId" value={loanId} />
      <SubmitButton
        size={fullWidth ? 'md' : 'sm'}
        className={fullWidth ? 'w-full' : 'max-md:w-full'}
        pendingLabel="Shranjujem …"
      >
        <i className="bi bi-box-arrow-up" aria-hidden="true" />
        Označi kot predano
      </SubmitButton>
    </form>
  );
}

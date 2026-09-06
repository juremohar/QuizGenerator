import { oznaciPredano } from '@/app/inventar/actions';
import { SubmitButton } from './SubmitButton';

export function PredanoButton({ loanId, className }: { loanId: number; className?: string }) {
  return (
    <form action={oznaciPredano}>
      <input type="hidden" name="loanId" value={loanId} />
      <SubmitButton
        className={className ?? 'btn btn-sm btn-primary'}
        pendingLabel="Shranjujem …"
      >
        Označi kot predano
      </SubmitButton>
    </form>
  );
}

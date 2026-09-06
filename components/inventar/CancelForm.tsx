import { preklici } from '@/app/inventar/actions';
import { SubmitButton } from './SubmitButton';

export function CancelForm({ loanId }: { loanId: number }) {
  return (
    <form action={preklici}>
      <input type="hidden" name="loanId" value={loanId} />
      <div className="mb-2">
        <label className="form-label" htmlFor="cancelReason">
          Razlog preklica (neobvezno)
        </label>
        <input className="form-control" id="cancelReason" name="cancelReason" />
      </div>
      <SubmitButton className="btn btn-outline-danger" pendingLabel="Shranjujem …">
        Prekliči rezervacijo
      </SubmitButton>
    </form>
  );
}

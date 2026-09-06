import { preklici } from '@/app/inventar/actions';
import { SubmitButton } from './SubmitButton';

/**
 * Folded behind a disclosure so cancelling is never one stray tap away from "Označi kot
 * predano", which sits directly above it. `<details>` keeps this a server component.
 */
export function CancelForm({ loanId }: { loanId: number }) {
  return (
    <details>
      <summary className="text-danger" style={{ cursor: 'pointer' }}>
        Prekliči rezervacijo
      </summary>

      <form action={preklici} className="mt-3">
        <input type="hidden" name="loanId" value={loanId} />
        <div className="mb-3">
          <label className="form-label" htmlFor="cancelReason">
            Razlog preklica <span className="text-secondary">(neobvezno)</span>
          </label>
          <input
            className="form-control"
            id="cancelReason"
            name="cancelReason"
            placeholder="npr. dogodek odpovedan"
          />
        </div>
        <SubmitButton className="btn btn-outline-danger w-100" pendingLabel="Shranjujem …">
          Potrdi preklic
        </SubmitButton>
      </form>
    </details>
  );
}

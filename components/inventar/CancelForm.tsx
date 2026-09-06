import { preklici } from '@/app/inventar/actions';
import { field, label } from '@/lib/ui';
import { SubmitButton } from './SubmitButton';

/**
 * Folded behind a disclosure so cancelling is never one stray tap away from "Označi kot
 * predano", which sits directly above it. `<details>` keeps this a server component.
 */
export function CancelForm({ loanId }: { loanId: number }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-red-700 hover:underline">
        <i className="bi bi-chevron-right mr-1 inline-block transition-transform group-open:rotate-90" aria-hidden="true" />
        Prekliči rezervacijo
      </summary>

      <form action={preklici} className="mt-3">
        <input type="hidden" name="loanId" value={loanId} />
        <div className="mb-3">
          <label className={label} htmlFor="cancelReason">
            Razlog preklica <span className="font-normal text-slate-400">(neobvezno)</span>
          </label>
          <input
            className={field}
            id="cancelReason"
            name="cancelReason"
            placeholder="npr. dogodek odpovedan"
          />
        </div>
        <SubmitButton variant="dangerSoft" className="w-full" pendingLabel="Shranjujem …">
          Potrdi preklic
        </SubmitButton>
      </form>
    </details>
  );
}

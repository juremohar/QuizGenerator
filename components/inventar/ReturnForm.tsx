'use client';

import { useActionState } from 'react';

import { oznaciVrnjeno } from '@/app/inventar/actions';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { SubmitButton } from './SubmitButton';

interface Props {
  loanId: number;
  /** True when the due date has already passed, so the extend option is worth offering. */
  overdue: boolean;
}

export function ReturnForm({ loanId, overdue }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(
    oznaciVrnjeno,
    EMPTY_FORM_STATE,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="loanId" value={loanId} />

      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {state.errors.map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
      )}

      <div className="mb-2">
        <label className="form-label" htmlFor="returnConditionNote">
          Stanje ob vrnitvi (poškodbe, manjkajoči kosi …)
        </label>
        <textarea
          className="form-control"
          id="returnConditionNote"
          name="returnConditionNote"
          rows={2}
        />
      </div>

      {overdue && (
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="extendToToday"
            name="extendToToday"
          />
          <label className="form-check-label" htmlFor="extendToToday">
            Podaljšaj obdobje do danes
          </label>
        </div>
      )}

      <SubmitButton className="btn btn-success" pendingLabel="Shranjujem …">
        Potrdi vrnitev
      </SubmitButton>
    </form>
  );
}

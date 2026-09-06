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

      <div className="mb-3">
        <label className="form-label" htmlFor="returnConditionNote">
          Stanje ob vrnitvi
        </label>
        <textarea
          className="form-control"
          id="returnConditionNote"
          name="returnConditionNote"
          rows={2}
          placeholder="poškodbe, manjkajoči kosi, umazanija …"
        />
        <div className="form-text">Pustite prazno, če je vse vrnjeno nepoškodovano.</div>
      </div>

      {overdue && (
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="extendToToday"
            name="extendToToday"
          />
          <label className="form-check-label" htmlFor="extendToToday">
            Podaljšaj obdobje do danes
            <span className="d-block form-text mt-0">
              Zapis ne bo več označen kot zamuda.
            </span>
          </label>
        </div>
      )}

      <SubmitButton className="btn btn-success w-100" pendingLabel="Shranjujem …">
        <i className="bi bi-check-lg me-2" aria-hidden="true" />
        Potrdi vrnitev
      </SubmitButton>
    </form>
  );
}

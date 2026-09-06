'use client';

import { useActionState } from 'react';

import { oznaciVrnjeno } from '@/app/inventar/actions';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { field, help, label } from '@/lib/ui';
import { SubmitButton } from './SubmitButton';

interface Props {
  loanId: number;
  /** True when the due date has already passed, so the extend option is worth offering. */
  overdue: boolean;
}

export function ReturnForm({ loanId, overdue }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(oznaciVrnjeno, EMPTY_FORM_STATE);

  return (
    <form action={formAction}>
      <input type="hidden" name="loanId" value={loanId} />

      {state.errors.length > 0 && (
        <div
          className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.errors.map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <label className={label} htmlFor="returnConditionNote">
          Stanje ob vrnitvi
        </label>
        <textarea
          className={field}
          id="returnConditionNote"
          name="returnConditionNote"
          rows={2}
          placeholder="poškodbe, manjkajoči kosi, umazanija …"
        />
        <p className={help}>Pustite prazno, če je vse vrnjeno nepoškodovano.</p>
      </div>

      {overdue && (
        <label className="mb-4 flex cursor-pointer gap-2.5">
          <input
            type="checkbox"
            id="extendToToday"
            name="extendToToday"
            className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
          />
          <span className="text-sm">
            <span className="font-medium text-slate-700">Podaljšaj obdobje do danes</span>
            <span className="block text-slate-500">Zapis ne bo več označen kot zamuda.</span>
          </span>
        </label>
      )}

      <SubmitButton variant="success" className="w-full" pendingLabel="Shranjujem …">
        <i className="bi bi-check-lg" aria-hidden="true" />
        Potrdi vrnitev
      </SubmitButton>
    </form>
  );
}

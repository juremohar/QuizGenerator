'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { shraniOpremo } from '@/app/inventar/actions';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { btn, card, cardBody, cx, errorText, field, fieldInvalid, help, label } from '@/lib/ui';
import { SubmitButton } from './SubmitButton';

interface Props {
  itemId?: number;
  initial?: {
    name: string;
    totalQuantity: number;
    active: boolean;
    sortOrder: number;
    notes: string;
  };
}

export function ItemForm({ itemId, initial }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(shraniOpremo, EMPTY_FORM_STATE);

  // Only surfaced after the server has refused a reduction, so the override is a
  // deliberate second step rather than something to tick past by default.
  const blockedByCommitments = state.errors.some((m) => m.startsWith('Znižanje'));

  return (
    <form action={formAction} className="space-y-4">
      {itemId !== undefined && <input type="hidden" name="itemId" value={itemId} />}

      {state.errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <p className="flex items-center gap-2 font-semibold text-red-800">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            Opreme ni bilo mogoče shraniti:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {state.errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <section className={card}>
        <div className={cx(cardBody, 'grid gap-4 sm:grid-cols-2')}>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="name">
              Ime opreme
            </label>
            <input
              className={cx(field, state.fieldErrors.name && fieldInvalid)}
              id="name"
              name="name"
              placeholder="npr. Mize"
              defaultValue={initial?.name}
              required
            />
            {state.fieldErrors.name && <p className={errorText}>{state.fieldErrors.name}</p>}
          </div>

          <div>
            <label className={label} htmlFor="totalQuantity">
              Skupaj kosov
            </label>
            <input
              className={cx(field, state.fieldErrors.totalQuantity && fieldInvalid)}
              id="totalQuantity"
              name="totalQuantity"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={initial?.totalQuantity ?? 1}
              required
            />
            {state.fieldErrors.totalQuantity ? (
              <p className={errorText}>{state.fieldErrors.totalQuantity}</p>
            ) : (
              <p className={help}>Koliko kosov ima društvo skupaj.</p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="sortOrder">
              Vrstni red
            </label>
            <input
              className={field}
              id="sortOrder"
              name="sortOrder"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={initial?.sortOrder ?? 0}
            />
            <p className={help}>Manjša številka je višje na seznamih.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="notes">
              Opombe
            </label>
            <textarea
              className={field}
              id="notes"
              name="notes"
              rows={2}
              placeholder="npr. hrani se v garaži, potrebna previdnost pri prevozu"
              defaultValue={initial?.notes}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer gap-2.5">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={initial?.active ?? true}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-700">
                  Aktivna – prikaži pri novih izposojah
                </span>
                <span className="block text-slate-500">
                  Arhivirana oprema ostane v zgodovini izposoj, le izbrati je ni več mogoče.
                </span>
              </span>
            </label>
          </div>

          {blockedByCommitments && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:col-span-2">
              <label className="flex cursor-pointer gap-2.5">
                <input
                  type="checkbox"
                  id="force"
                  name="force"
                  className="mt-0.5 size-4 shrink-0 rounded border-amber-300 text-amber-700 focus:ring-amber-500/20"
                />
                <span className="text-sm">
                  <span className="font-semibold text-amber-900">
                    Vseeno shrani in dovoli presežek nad zalogo
                  </span>
                  <span className="block text-amber-800">
                    Obstoječe rezervacije bodo skupaj zahtevale več kosov, kot jih je na
                    zalogi. Uporabite samo, če veste, kaj delate.
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton className="max-sm:w-full" pendingLabel="Shranjujem …">
          Shrani
        </SubmitButton>
        <Link className={btn('secondary', 'md', 'max-sm:w-full')} href="/inventar/oprema">
          Prekliči
        </Link>
      </div>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { shraniOpremo } from '@/app/inventar/actions';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
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
    <form action={formAction}>
      {itemId !== undefined && <input type="hidden" name="itemId" value={itemId} />}

      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {state.errors.map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="name">
            Ime opreme
          </label>
          <input
            className={`form-control ${state.fieldErrors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            defaultValue={initial?.name}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.name}</div>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="totalQuantity">
            Skupaj kosov
          </label>
          <input
            className={`form-control ${state.fieldErrors.totalQuantity ? 'is-invalid' : ''}`}
            id="totalQuantity"
            name="totalQuantity"
            type="number"
            min={1}
            defaultValue={initial?.totalQuantity ?? 1}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.totalQuantity}</div>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="sortOrder">
            Vrstni red
          </label>
          <input
            className="form-control"
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={initial?.sortOrder ?? 0}
          />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="notes">
            Opombe
          </label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            rows={2}
            defaultValue={initial?.notes}
          />
        </div>

        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={initial?.active ?? true}
            />
            <label className="form-check-label" htmlFor="active">
              Aktivna – prikaži pri novih izposojah
            </label>
          </div>
        </div>

        {blockedByCommitments && (
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="force" name="force" />
              <label className="form-check-label text-danger" htmlFor="force">
                Vseeno shrani (ustvari prekomerno zasedenost)
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex gap-2 mt-4">
        <SubmitButton pendingLabel="Shranjujem …">Shrani</SubmitButton>
        <Link className="btn btn-outline-secondary" href="/inventar/oprema">
          Prekliči
        </Link>
      </div>
    </form>
  );
}

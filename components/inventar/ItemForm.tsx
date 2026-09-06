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
          <strong>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            Opreme ni bilo mogoče shraniti:
          </strong>
          <ul className="mb-0 mt-2">
            {state.errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="name">
                Ime opreme
              </label>
              <input
                className={`form-control ${state.fieldErrors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                placeholder="npr. Mize"
                defaultValue={initial?.name}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.name}</div>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="totalQuantity">
                Skupaj kosov
              </label>
              <input
                className={`form-control ${state.fieldErrors.totalQuantity ? 'is-invalid' : ''}`}
                id="totalQuantity"
                name="totalQuantity"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={initial?.totalQuantity ?? 1}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.totalQuantity}</div>
              <div className="form-text">Koliko kosov ima društvo skupaj.</div>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="sortOrder">
                Vrstni red
              </label>
              <input
                className="form-control"
                id="sortOrder"
                name="sortOrder"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={initial?.sortOrder ?? 0}
              />
              <div className="form-text">Manjša številka je višje na seznamih.</div>
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
                placeholder="npr. hrani se v garaži, potrebna previdnost pri prevozu"
                defaultValue={initial?.notes}
              />
            </div>

            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="active"
                  name="active"
                  defaultChecked={initial?.active ?? true}
                />
                <label className="form-check-label" htmlFor="active">
                  Aktivna – prikaži pri novih izposojah
                </label>
              </div>
              <div className="form-text">
                Arhivirana oprema ostane v zgodovini izposoj, le izbrati je ni več mogoče.
              </div>
            </div>

            {blockedByCommitments && (
              <div className="col-12">
                <div className="alert alert-warning mb-0">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="force" name="force" />
                    <label className="form-check-label fw-semibold" htmlFor="force">
                      Vseeno shrani in dovoli presežek nad zalogo
                    </label>
                  </div>
                  <div className="form-text mb-0">
                    Obstoječe rezervacije bodo skupaj zahtevale več kosov, kot jih je na
                    zalogi. Uporabite samo, če veste, kaj delate.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <SubmitButton className="btn btn-primary w-100 w-sm-auto" pendingLabel="Shranjujem …">
          Shrani
        </SubmitButton>
        <Link className="btn btn-outline-secondary w-100 w-sm-auto" href="/inventar/oprema">
          Prekliči
        </Link>
      </div>
    </form>
  );
}

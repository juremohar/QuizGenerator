'use client';

import { useActionState, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { daysInclusive } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { SubmitButton } from './SubmitButton';

export interface OpremaOption {
  id: number;
  name: string;
  totalQuantity: number;
}

export interface LoanFormLine {
  itemId: number | '';
  quantity: number | '';
}

/** Identity for React's key, so removing a line does not reshuffle the ones below it. */
interface KeyedLine extends LoanFormLine {
  key: number;
}

interface Props {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  oprema: readonly OpremaOption[];
  loanId?: number;
  initial?: {
    borrowerName: string;
    borrowerPhone: string;
    purpose: string;
    fromDate: string;
    toDate: string;
    lines: LoanFormLine[];
  };
  submitLabel?: string;
  cancelHref: string;
}

const MIZE = /^mize$/i;
const KLOPI = /^klopi$/i;

export function LoanForm({
  action,
  oprema,
  loanId,
  initial,
  submitLabel = 'Shrani rezervacijo',
  cancelHref,
}: Props) {
  const uid = useId();
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const [lines, setLines] = useState<KeyedLine[]>(() => {
    const start: LoanFormLine[] = initial?.lines?.length
      ? initial.lines
      : [{ itemId: '', quantity: 1 }];
    return start.map((l, i) => ({ ...l, key: i }));
  });
  // Keys for the initial lines are their indexes so the server and the client agree on
  // the generated field ids; only lines added after mount draw from the counter.
  const nextKey = useRef(lines.length);
  const [from, setFrom] = useState(initial?.fromDate ?? '');
  const [to, setTo] = useState(initial?.toDate ?? '');

  const mize = oprema.find((o) => MIZE.test(o.name));
  const klopi = oprema.find((o) => KLOPI.test(o.name));

  /** Benches come with the tables, so offer the matching pair rather than making
      someone remember the 2:1 ratio. */
  const tablesLine = mize ? lines.find((l) => l.itemId === mize.id) : undefined;
  const benchesMissing =
    !!mize &&
    !!klopi &&
    !!tablesLine &&
    typeof tablesLine.quantity === 'number' &&
    tablesLine.quantity > 0 &&
    !lines.some((l) => l.itemId === klopi.id);

  const trajanje = from && to && from <= to ? daysInclusive(from, to) : null;

  function update(key: number, patch: Partial<LoanFormLine>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  return (
    <form action={formAction}>
      {loanId !== undefined && <input type="hidden" name="loanId" value={loanId} />}

      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            Rezervacije ni bilo mogoče shraniti:
          </strong>
          <ul className="mb-0 mt-2">
            {state.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card shadow-sm mb-3">
        <div className="card-header">
          <strong>
            <i className="bi bi-person me-2" aria-hidden="true" />
            Kdo si izposoja
          </strong>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="borrowerName">
                Ime in priimek
              </label>
              <input
                className={`form-control ${state.fieldErrors.borrowerName ? 'is-invalid' : ''}`}
                id="borrowerName"
                name="borrowerName"
                autoComplete="name"
                defaultValue={initial?.borrowerName}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.borrowerName}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="borrowerPhone">
                Telefon
              </label>
              <input
                className={`form-control ${state.fieldErrors.borrowerPhone ? 'is-invalid' : ''}`}
                id="borrowerPhone"
                name="borrowerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="041 123 456"
                defaultValue={initial?.borrowerPhone}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.borrowerPhone}</div>
              <div className="form-text">Na to številko pokličete, če oprema ni vrnjena v roku.</div>
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="purpose">
                Dogodek / namen
              </label>
              <textarea
                className={`form-control ${state.fieldErrors.purpose ? 'is-invalid' : ''}`}
                id="purpose"
                name="purpose"
                rows={2}
                placeholder="npr. Gasilska veselica, krst gasilskega vozila …"
                defaultValue={initial?.purpose}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.purpose}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>
            <i className="bi bi-calendar3 me-2" aria-hidden="true" />
            Obdobje
          </strong>
          {/* Running total: a two-week booking entered by mistyping the year is obvious
              the moment the day count is on screen. */}
          {trajanje !== null && (
            <span className="text-secondary small">{stevilo(trajanje, DAN)}</span>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="fromDate">
                Od
              </label>
              <input
                className={`form-control ${state.fieldErrors.fromDate ? 'is-invalid' : ''}`}
                id="fromDate"
                name="fromDate"
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  if (e.target.value > to) setTo(e.target.value);
                }}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.fromDate}</div>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="toDate">
                Do
              </label>
              <input
                className={`form-control ${state.fieldErrors.toDate ? 'is-invalid' : ''}`}
                id="toDate"
                name="toDate"
                type="date"
                min={from || undefined}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
              <div className="invalid-feedback">{state.fieldErrors.toDate}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>
            <i className="bi bi-boxes me-2" aria-hidden="true" />
            Oprema
          </strong>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() =>
              setLines((prev) => [...prev, { itemId: '', quantity: 1, key: nextKey.current++ }])
            }
          >
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Dodaj vrstico
          </button>
        </div>
        <div className="card-body">
          {state.fieldErrors.items && (
            <div className="text-danger small mb-2">{state.fieldErrors.items}</div>
          )}

          {lines.map((line, index) => {
            const selected = oprema.find((o) => o.id === line.itemId);
            return (
              <div className="row g-2 align-items-end mb-3 mb-md-2" key={line.key}>
                <div className="col-12 col-md-6">
                  <label className="form-label small mb-1" htmlFor={`${uid}-item-${line.key}`}>
                    Oprema {index + 1}
                  </label>
                  <select
                    className="form-select"
                    id={`${uid}-item-${line.key}`}
                    name="itemId"
                    value={line.itemId}
                    onChange={(e) => update(line.key, { itemId: Number(e.target.value) || '' })}
                    required
                  >
                    <option value="">– izberite opremo –</option>
                    {oprema.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} (skupaj {o.totalQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-8 col-md-3">
                  {/* Was an unlabelled number box; on a phone it read as a stray field. */}
                  <label className="form-label small mb-1" htmlFor={`${uid}-qty-${line.key}`}>
                    Kosov{selected ? ` (največ ${selected.totalQuantity})` : ''}
                  </label>
                  <input
                    className="form-control"
                    id={`${uid}-qty-${line.key}`}
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={selected?.totalQuantity}
                    value={line.quantity}
                    onChange={(e) => update(line.key, { quantity: Number(e.target.value) || '' })}
                    required
                  />
                </div>

                <div className="col-4 col-md-3">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                      aria-label={`Odstrani vrstico ${index + 1}`}
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                      <span className="d-none d-md-inline ms-1">Odstrani</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {benchesMissing && klopi && tablesLine && (
            <div className="alert alert-info d-flex flex-wrap align-items-center gap-2 py-2 mb-0">
              <span>
                <i className="bi bi-lightbulb me-1" aria-hidden="true" />
                Klopi gredo skupaj z mizami.
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  setLines((prev) => [
                    ...prev,
                    {
                      itemId: klopi.id,
                      quantity: Number(tablesLine.quantity) * 2,
                      key: nextKey.current++,
                    },
                  ])
                }
              >
                Dodaj {Number(tablesLine.quantity) * 2} klopi
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <SubmitButton className="btn btn-primary w-100 w-sm-auto" pendingLabel="Shranjujem …">
          {submitLabel}
        </SubmitButton>
        <Link className="btn btn-outline-secondary w-100 w-sm-auto" href={cancelHref}>
          Prekliči
        </Link>
      </div>
    </form>
  );
}

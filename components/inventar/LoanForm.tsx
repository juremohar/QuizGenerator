'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

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
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const [lines, setLines] = useState<LoanFormLine[]>(
    initial?.lines?.length ? initial.lines : [{ itemId: '', quantity: 1 }],
  );

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

  function update(index: number, patch: Partial<LoanFormLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  return (
    <form action={formAction}>
      {loanId !== undefined && <input type="hidden" name="loanId" value={loanId} />}

      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>Rezervacije ni bilo mogoče shraniti:</strong>
          <ul className="mb-0 mt-2">
            {state.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="borrowerName">
            Izposojevalec (ime in priimek)
          </label>
          <input
            className={`form-control ${state.fieldErrors.borrowerName ? 'is-invalid' : ''}`}
            id="borrowerName"
            name="borrowerName"
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
            defaultValue={initial?.borrowerPhone}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.borrowerPhone}</div>
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
            defaultValue={initial?.purpose}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.purpose}</div>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="fromDate">
            Od
          </label>
          <input
            className={`form-control ${state.fieldErrors.fromDate ? 'is-invalid' : ''}`}
            id="fromDate"
            name="fromDate"
            type="date"
            defaultValue={initial?.fromDate}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.fromDate}</div>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="toDate">
            Do
          </label>
          <input
            className={`form-control ${state.fieldErrors.toDate ? 'is-invalid' : ''}`}
            id="toDate"
            name="toDate"
            type="date"
            defaultValue={initial?.toDate}
            required
          />
          <div className="invalid-feedback">{state.fieldErrors.toDate}</div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Oprema</strong>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setLines((prev) => [...prev, { itemId: '', quantity: 1 }])}
        >
          Dodaj opremo
        </button>
      </div>

      {state.fieldErrors.items && (
        <div className="text-danger small mb-2">{state.fieldErrors.items}</div>
      )}

      {lines.map((line, index) => {
        const selected = oprema.find((o) => o.id === line.itemId);
        return (
          <div className="row g-2 align-items-end mb-2" key={index}>
            <div className="col-md-6">
              <select
                className="form-select"
                name="itemId"
                value={line.itemId}
                onChange={(e) => update(index, { itemId: Number(e.target.value) || '' })}
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
            <div className="col-md-3">
              <input
                className="form-control"
                name="quantity"
                type="number"
                min={1}
                max={selected?.totalQuantity}
                value={line.quantity}
                onChange={(e) => update(index, { quantity: Number(e.target.value) || '' })}
                required
              />
            </div>
            <div className="col-md-3">
              {lines.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                >
                  Odstrani
                </button>
              )}
            </div>
          </div>
        );
      })}

      {benchesMissing && klopi && tablesLine && (
        <div className="alert alert-info py-2">
          Klopi gredo skupaj z mizami.{' '}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={() =>
              setLines((prev) => [
                ...prev,
                { itemId: klopi.id, quantity: Number(tablesLine.quantity) * 2 },
              ])
            }
          >
            Dodaj {Number(tablesLine.quantity) * 2} klopi
          </button>
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <SubmitButton pendingLabel="Shranjujem …">{submitLabel}</SubmitButton>
        <Link className="btn btn-outline-secondary" href={cancelHref}>
          Prekliči
        </Link>
      </div>
    </form>
  );
}

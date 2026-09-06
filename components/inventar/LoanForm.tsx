'use client';

import { useActionState, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { daysInclusive } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { btn, card, cardBody, cardHeader, cx, errorText, field, fieldInvalid, help, label } from '@/lib/ui';
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
    <form action={formAction} className="space-y-4">
      {loanId !== undefined && <input type="hidden" name="loanId" value={loanId} />}

      {state.errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <p className="flex items-center gap-2 font-semibold text-red-800">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            Rezervacije ni bilo mogoče shraniti:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {state.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <section className={card}>
        <div className={cardHeader}>
          <span className="flex items-center gap-2">
            <i className="bi bi-person text-slate-400" aria-hidden="true" />
            Kdo si izposoja
          </span>
        </div>
        <div className={cx(cardBody, 'grid gap-4 sm:grid-cols-2')}>
          <div>
            <label className={label} htmlFor="borrowerName">
              Ime in priimek
            </label>
            <input
              className={cx(field, state.fieldErrors.borrowerName && fieldInvalid)}
              id="borrowerName"
              name="borrowerName"
              autoComplete="name"
              defaultValue={initial?.borrowerName}
              required
            />
            {state.fieldErrors.borrowerName && (
              <p className={errorText}>{state.fieldErrors.borrowerName}</p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="borrowerPhone">
              Telefon
            </label>
            <input
              className={cx(field, state.fieldErrors.borrowerPhone && fieldInvalid)}
              id="borrowerPhone"
              name="borrowerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="041 123 456"
              defaultValue={initial?.borrowerPhone}
              required
            />
            {state.fieldErrors.borrowerPhone ? (
              <p className={errorText}>{state.fieldErrors.borrowerPhone}</p>
            ) : (
              <p className={help}>Na to številko pokličete, če oprema ni vrnjena v roku.</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="purpose">
              Dogodek / namen
            </label>
            <textarea
              className={cx(field, state.fieldErrors.purpose && fieldInvalid)}
              id="purpose"
              name="purpose"
              rows={2}
              placeholder="npr. Gasilska veselica, krst gasilskega vozila …"
              defaultValue={initial?.purpose}
              required
            />
            {state.fieldErrors.purpose && <p className={errorText}>{state.fieldErrors.purpose}</p>}
          </div>
        </div>
      </section>

      <section className={card}>
        <div className={cardHeader}>
          <span className="flex items-center gap-2">
            <i className="bi bi-calendar3 text-slate-400" aria-hidden="true" />
            Obdobje
          </span>
          {/* Running total: a two-week booking entered by mistyping the year is obvious
              the moment the day count is on screen. */}
          {trajanje !== null && (
            <span className="text-sm font-normal text-slate-500">{stevilo(trajanje, DAN)}</span>
          )}
        </div>
        <div className={cx(cardBody, 'grid max-w-md grid-cols-2 gap-4')}>
          <div>
            <label className={label} htmlFor="fromDate">
              Od
            </label>
            <input
              className={cx(field, state.fieldErrors.fromDate && fieldInvalid)}
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
            {state.fieldErrors.fromDate && <p className={errorText}>{state.fieldErrors.fromDate}</p>}
          </div>

          <div>
            <label className={label} htmlFor="toDate">
              Do
            </label>
            <input
              className={cx(field, state.fieldErrors.toDate && fieldInvalid)}
              id="toDate"
              name="toDate"
              type="date"
              min={from || undefined}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            {state.fieldErrors.toDate && <p className={errorText}>{state.fieldErrors.toDate}</p>}
          </div>
        </div>
      </section>

      <section className={card}>
        <div className={cardHeader}>
          <span className="flex items-center gap-2">
            <i className="bi bi-boxes text-slate-400" aria-hidden="true" />
            Oprema
          </span>
          <button
            type="button"
            className={btn('secondary', 'sm')}
            onClick={() =>
              setLines((prev) => [...prev, { itemId: '', quantity: 1, key: nextKey.current++ }])
            }
          >
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Dodaj vrstico
          </button>
        </div>
        <div className={cardBody}>
          {state.fieldErrors.items && (
            <p className="mb-3 text-sm text-red-600">{state.fieldErrors.items}</p>
          )}

          <div className="space-y-4">
            {lines.map((line, index) => {
              const selected = oprema.find((o) => o.id === line.itemId);
              return (
                <div className="flex flex-wrap items-end gap-3" key={line.key}>
                  <div className="min-w-56 flex-1">
                    <label className={label} htmlFor={`${uid}-item-${line.key}`}>
                      Oprema {index + 1}
                    </label>
                    <select
                      className={field}
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

                  <div className="w-32">
                    {/* Was an unlabelled number box; on a phone it read as a stray field. */}
                    <label className={label} htmlFor={`${uid}-qty-${line.key}`}>
                      Kosov{selected ? ` / ${selected.totalQuantity}` : ''}
                    </label>
                    <input
                      className={field}
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

                  {lines.length > 1 && (
                    <button
                      type="button"
                      className={btn('dangerSoft', 'md', 'aspect-square px-0')}
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                      aria-label={`Odstrani vrstico ${index + 1}`}
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {benchesMissing && klopi && tablesLine && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <span className="flex items-center gap-2">
                <i className="bi bi-lightbulb" aria-hidden="true" />
                Klopi gredo skupaj z mizami.
              </span>
              <button
                type="button"
                className={btn('secondary', 'sm')}
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
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton className="max-sm:w-full" pendingLabel="Shranjujem …">
          {submitLabel}
        </SubmitButton>
        <Link className={btn('secondary', 'md', 'max-sm:w-full')} href={cancelHref}>
          Prekliči
        </Link>
      </div>
    </form>
  );
}

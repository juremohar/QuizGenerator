'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import { razpolozljivostZaObdobje, type RazpolozljivostKosov } from '@/app/inventar/actions';
import { EMPTY_FORM_STATE, type FormState } from '@/lib/inventory/form-state';
import { btn, card, cardBody, cardHeader, cx, errorText, field, fieldInvalid, help, label } from '@/lib/ui';
import { DateRangeField } from './DateRangeField';
import { SubmitButton } from './SubmitButton';

/** Marks a field the server will reject if left empty. */
function Req() {
  return (
    <span className="ml-0.5 text-red-600" title="obvezno polje">
      *<span className="sr-only"> (obvezno)</span>
    </span>
  );
}

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
  /** Today on the Ljubljana clock, from the server. */
  danes: string;
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
  danes,
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

  /**
   * Free stock for the chosen period, keyed by item id. `null` until the first answer
   * arrives (and after a failure), which is the signal to fall back to total stock
   * rather than to cap everything at zero and block a legitimate booking.
   */
  const [prosto, setProsto] = useState<Map<number, RazpolozljivostKosov> | null>(null);

  useEffect(() => {
    if (!from || !to || from > to) return;
    // A late reply from a period the user has already moved on from must not overwrite
    // a newer one, so each request checks whether it is still the current one.
    let current = true;
    setProsto(null);
    razpolozljivostZaObdobje(from, to, loanId)
      .then((rows) => {
        if (current) setProsto(new Map(rows.map((r) => [r.itemId, r])));
      })
      .catch(() => {
        if (current) setProsto(null);
      });
    return () => {
      current = false;
    };
  }, [from, to, loanId]);

  /** What this line may ask for: free stock when known, total stock when not. */
  function maxFor(itemId: number | ''): number | undefined {
    if (itemId === '') return undefined;
    const item = oprema.find((o) => o.id === itemId);
    return prosto?.get(itemId)?.available ?? item?.totalQuantity;
  }

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
              <Req />
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
              <Req />
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
              <Req />
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
            <Req />
          </span>
        </div>
        <div className={cx(cardBody, 'max-w-sm')}>
          {/* Two fields, one shared calendar that opens on demand. The values still post
              as fromDate/toDate, so the Server Action is unchanged. */}
          <DateRangeField
            from={from}
            to={to}
            danes={danes}
            invalid={Boolean(state.fieldErrors.fromDate || state.fieldErrors.toDate)}
            onChange={(a, b) => {
              setFrom(a);
              setTo(b);
            }}
          />
          <input type="hidden" name="fromDate" value={from} />
          <input type="hidden" name="toDate" value={to} />
          {(state.fieldErrors.fromDate || state.fieldErrors.toDate) && (
            <p className={errorText}>{state.fieldErrors.fromDate ?? state.fieldErrors.toDate}</p>
          )}
        </div>
      </section>

      <section className={card}>
        <div className={cardHeader}>
          <span className="flex items-center gap-2">
            <i className="bi bi-boxes text-slate-400" aria-hidden="true" />
            Oprema
            <Req />
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
              const max = maxFor(line.itemId);
              const tooMany =
                typeof line.quantity === 'number' && max !== undefined && line.quantity > max;
              return (
                <div className="flex flex-wrap items-end gap-3" key={line.key}>
                  <div className="min-w-56 flex-1">
                    <label className={label} htmlFor={`${uid}-item-${line.key}`}>
                      Oprema {index + 1}
                      <Req />
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
                      {oprema.map((o) => {
                        const free = prosto?.get(o.id)?.available;
                        return (
                          <option key={o.id} value={o.id} disabled={free === 0}>
                            {o.name}
                            {free === undefined
                              ? ` (skupaj ${o.totalQuantity})`
                              : free === 0
                                ? ' – ni na voljo'
                                : ` (na voljo ${free} od ${o.totalQuantity})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-32">
                    {/* Was an unlabelled number box; on a phone it read as a stray field. */}
                    <label className={label} htmlFor={`${uid}-qty-${line.key}`}>
                      Kosov
                      <Req />
                      {max !== undefined && (
                        <span className="ml-1 font-normal text-slate-400">/ {max}</span>
                      )}
                    </label>
                    <input
                      className={cx(field, tooMany && fieldInvalid)}
                      id={`${uid}-qty-${line.key}`}
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={max}
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { addDays, daysInclusive, startOfWeek, type IsoDate } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { btn, card, cardBody, cx, field, label } from '@/lib/ui';

interface Props {
  od: string;
  do: string;
  /** Today on the Ljubljana clock, from the server, so the presets match the page. */
  danes: string;
  action?: string;
  submitLabel?: string;
}

/** Saturday and Sunday of the current week, never starting before today. */
function vikend(danes: IsoDate): [IsoDate, IsoDate] {
  const sobota = addDays(startOfWeek(danes), 5);
  const nedelja = addDays(sobota, 1);
  return [sobota < danes ? danes : sobota, nedelja];
}

/**
 * State lives in the URL so a checked period is linkable and shareable, and the server
 * does the computing. No Server Action needed.
 */
export function DateRangeForm({
  od,
  do: doDate,
  danes,
  action = '',
  submitLabel = 'Preveri',
}: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(od);
  const [to, setTo] = useState(doDate);

  const invalid = from > to;

  // Most checks are one of a handful of periods; typing two dates for "this weekend"
  // on a phone keyboard is the slowest possible way to ask that question.
  const presets: { label: string; range: [string, string] }[] = [
    { label: 'Danes', range: [danes, danes] },
    { label: 'Ta vikend', range: vikend(danes) },
    { label: '7 dni', range: [danes, addDays(danes, 6)] },
    { label: '14 dni', range: [danes, addDays(danes, 13)] },
  ];

  return (
    <div className={card}>
      <div className={cardBody}>
        <div className="mb-4 flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = from === p.range[0] && to === p.range[1];
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                className={cx(
                  'min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                )}
                onClick={() => {
                  setFrom(p.range[0]);
                  setTo(p.range[1]);
                  router.push(`${action}?od=${p.range[0]}&do=${p.range[1]}`);
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (invalid) return;
            router.push(`${action}?od=${from}&do=${to}`);
          }}
        >
          <div className="min-w-36 flex-1 sm:flex-none">
            <label className={label} htmlFor="od">
              Od
            </label>
            <input
              className={field}
              type="date"
              id="od"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                // Keep the range sane rather than letting the user submit something invalid.
                if (e.target.value > to) setTo(e.target.value);
              }}
            />
          </div>
          <div className="min-w-36 flex-1 sm:flex-none">
            <label className={label} htmlFor="do">
              Do
            </label>
            <input
              className={field}
              type="date"
              id="do"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button className={btn('primary', 'md', 'max-sm:w-full')} type="submit" disabled={invalid}>
            <i className="bi bi-search" aria-hidden="true" />
            {submitLabel}
          </button>

          {invalid ? (
            <p className="w-full text-sm text-red-600">
              Datum &quot;do&quot; ne more biti pred datumom &quot;od&quot;.
            </p>
          ) : (
            <span className="pb-3 text-sm text-slate-500">
              {stevilo(daysInclusive(from, to), DAN)}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}

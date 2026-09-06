'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { addDays, startOfWeek, type IsoDate } from '@/lib/dates';
import { btn, card, cardBody, cx } from '@/lib/ui';
import { DateRangeField } from './DateRangeField';

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
          className="flex flex-wrap items-start gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (invalid) return;
            router.push(`${action}?od=${from}&do=${to}`);
          }}
        >
          {/* Same control as the loan form, so the two views behave identically. */}
          <div className="min-w-64 flex-1">
            <DateRangeField
              from={from}
              to={to}
              danes={danes}
              invalid={invalid}
              onChange={(a, b) => {
                setFrom(a);
                setTo(b);
              }}
            />
          </div>
          <div className="max-sm:w-full">
            {/* An empty stand-in for the "Od"/"Do" labels. Aligning to the bottom instead
                would line the button up with the day-count caption under the fields, not
                with the fields themselves; this tracks the real label's height because it
                carries the same classes. */}
            <span aria-hidden="true" className="mb-1.5 hidden text-sm font-medium sm:block">
              &nbsp;
            </span>
            <button
              className={btn('primary', 'md', 'max-sm:w-full')}
              type="submit"
              disabled={invalid}
            >
              <i className="bi bi-search" aria-hidden="true" />
              {submitLabel}
            </button>
          </div>

          {invalid && (
            <p className="w-full text-sm text-red-600">
              Datum &quot;do&quot; ne more biti pred datumom &quot;od&quot;.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

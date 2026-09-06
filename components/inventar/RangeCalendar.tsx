'use client';

import { useState } from 'react';

import { addDays, startOfWeek, type IsoDate } from '@/lib/dates';
import { cx } from '@/lib/ui';

interface Props {
  from: IsoDate;
  to: IsoDate;
  /** `complete` is false on the first click of a new range and true on the second. */
  onChange: (from: IsoDate, to: IsoDate, complete: boolean) => void;
  /** Today on the Ljubljana clock, from the server, so "danes" matches the rest of the app. */
  danes: IsoDate;
  /** Which end the user opened the calendar on; the month shown starts there. */
  startWith?: 'from' | 'to';
}

const MESECI = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
];

// Monday-first, like every Slovenian wall calendar.
const DNEVI = ['Po', 'To', 'Sr', 'Če', 'Pe', 'So', 'Ne'];

/**
 * Built on the `IsoDate` string helpers rather than a date-picker library.
 *
 * Every such library speaks in JS `Date` objects, and lib/dates.ts exists precisely
 * because `new Date('2026-09-01')` parses as UTC midnight - mix that with local-time
 * accessors and you get off-by-one days that only appear at certain times of day. Doing
 * the arithmetic on 'YYYY-MM-DD' strings keeps that whole class of bug out.
 */
function monthGrid(anchor: IsoDate): IsoDate[] {
  const [y, m] = anchor.split('-').map(Number);
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const start = startOfWeek(first);
  // Six weeks always: a fixed height stops the form jumping as you page through months.
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function monthOf(date: IsoDate): number {
  return Number(date.split('-')[1]);
}

function addMonths(anchor: IsoDate, delta: number): IsoDate {
  const [y, m] = anchor.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}

export function RangeCalendar({ from, to, onChange, danes, startWith = 'from' }: Props) {
  const [anchor, setAnchor] = useState<IsoDate>((startWith === 'to' ? to : from) || danes);
  /** Set while the user has clicked a start but not yet an end. */
  const [pendingStart, setPendingStart] = useState<IsoDate | null>(null);

  const days = monthGrid(anchor);
  const shownMonth = monthOf(addMonths(anchor, 0));

  function pick(day: IsoDate) {
    if (pendingStart === null) {
      // First click always restarts the range, so a mis-click is one more click to fix
      // rather than something you have to undo.
      setPendingStart(day);
      onChange(day, day, false);
      return;
    }
    const [a, b] = day < pendingStart ? [day, pendingStart] : [pendingStart, day];
    setPendingStart(null);
    onChange(a, b, true);
  }

  const rangeFrom = pendingStart ?? from;
  const rangeTo = pendingStart ?? to;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAnchor(addMonths(anchor, -1))}
          aria-label="Prejšnji mesec"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </button>
        <div className="text-sm font-semibold text-slate-900">
          {MESECI[shownMonth - 1]} {anchor.split('-')[0]}
        </div>
        <button
          type="button"
          onClick={() => setAnchor(addMonths(anchor, 1))}
          aria-label="Naslednji mesec"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DNEVI.map((d) => (
          <div key={d} className="pb-1 text-xs font-medium text-slate-400">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const outside = monthOf(day) !== shownMonth;
          const isStart = day === rangeFrom;
          const isEnd = day === rangeTo;
          const inRange = day > rangeFrom && day < rangeTo;
          const selected = isStart || isEnd;

          return (
            <div
              key={day}
              className={cx(
                'py-0.5',
                // The connecting band is drawn on the wrapper so the range reads as one
                // continuous bar rather than a row of separate circles.
                inRange && 'bg-slate-100',
                isStart && !isEnd && 'rounded-l-full bg-slate-100',
                isEnd && !isStart && 'rounded-r-full bg-slate-100',
              )}
            >
              <button
                type="button"
                onClick={() => pick(day)}
                aria-pressed={selected}
                aria-label={day}
                className={cx(
                  'mx-auto flex size-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors',
                  selected && 'bg-slate-900 font-semibold text-white',
                  !selected && inRange && 'text-slate-900',
                  !selected && !inRange && 'hover:bg-slate-200',
                  !selected && outside && 'text-slate-300',
                  !selected && !outside && !inRange && 'text-slate-700',
                  day === danes && !selected && 'ring-1 ring-blue-400 ring-inset',
                )}
              >
                {Number(day.slice(8))}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm text-slate-500" aria-live="polite">
        {pendingStart ? 'Izberite še datum vrnitve …' : 'Kliknite prevzem, nato vrnitev.'}
      </p>
    </div>
  );
}

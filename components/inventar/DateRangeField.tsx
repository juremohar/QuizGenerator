'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { daysInclusive, formatSl, type IsoDate } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';
import { cx } from '@/lib/ui';
import { RangeCalendar } from './RangeCalendar';

interface Props {
  from: IsoDate;
  to: IsoDate;
  onChange: (from: IsoDate, to: IsoDate) => void;
  /** Today on the Ljubljana clock, from the server. */
  danes: IsoDate;
  invalid?: boolean;
}

/**
 * The two dates as two labelled fields, with one shared calendar that opens on demand.
 *
 * Both ends are picked in a single popover - click the pickup day, then the return day -
 * so it is one gesture rather than two separate pickers, but the calendar stays out of
 * the way until asked for instead of occupying half the form on page load.
 */
export function DateRangeField({ from, to, onChange, danes, invalid }: Props) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  /** Which field was clicked, so the calendar can show that end first. */
  const [focused, setFocused] = useState<'from' | 'to'>('from');
  const wrap = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape, the two ways anyone expects a popover to shut.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function field(which: 'from' | 'to', value: IsoDate, text: string) {
    const active = open && focused === which;
    return (
      <button
        type="button"
        id={`${uid}-${which}`}
        onClick={() => {
          setFocused(which);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cx(
          'flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-base',
          active ? 'border-slate-400 ring-4 ring-slate-900/5' : 'border-slate-300',
          invalid && 'border-red-400',
          !value && 'text-slate-400',
        )}
      >
        {text}
        <i className="bi bi-calendar3 text-slate-400" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div ref={wrap} className="relative">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${uid}-from`}>
            Od
          </label>
          {field('from', from, from ? formatSl(from) : 'Izberite …')}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${uid}-to`}>
            Do
          </label>
          {field('to', to, to ? formatSl(to) : 'Izberite …')}
        </div>
      </div>

      {from && to && from <= to && (
        <p className="mt-1.5 text-sm text-slate-500">{stevilo(daysInclusive(from, to), DAN)}</p>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Izberite obdobje"
          className="absolute z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <RangeCalendar
            from={from}
            to={to}
            danes={danes}
            startWith={focused}
            onChange={(a, b, complete) => {
              onChange(a, b);
              // Stay open through the first click so the second one can land; close as
              // soon as the range is whole.
              if (complete) setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

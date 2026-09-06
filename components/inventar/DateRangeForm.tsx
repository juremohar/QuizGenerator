'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { addDays, daysInclusive, startOfWeek, type IsoDate } from '@/lib/dates';
import { DAN, stevilo } from '@/lib/sl';

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
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className={`btn btn-sm ${
                from === p.range[0] && to === p.range[1]
                  ? 'btn-secondary'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => {
                setFrom(p.range[0]);
                setTo(p.range[1]);
                router.push(`${action}?od=${p.range[0]}&do=${p.range[1]}`);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form
          className="row g-2 align-items-end"
          onSubmit={(event) => {
            event.preventDefault();
            if (invalid) return;
            router.push(`${action}?od=${from}&do=${to}`);
          }}
        >
          <div className="col-6 col-sm-auto">
            <label className="form-label" htmlFor="od">
              Od
            </label>
            <input
              className="form-control"
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
          <div className="col-6 col-sm-auto">
            <label className="form-label" htmlFor="do">
              Do
            </label>
            <input
              className="form-control"
              type="date"
              id="do"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-auto">
            <button className="btn btn-primary w-100 w-sm-auto" type="submit" disabled={invalid}>
              <i className="bi bi-search me-2" aria-hidden="true" />
              {submitLabel}
            </button>
          </div>
          {!invalid && (
            <div className="col-12 col-sm-auto">
              <span className="text-secondary small">{stevilo(daysInclusive(from, to), DAN)}</span>
            </div>
          )}
          {invalid && (
            <div className="col-12">
              <div className="text-danger small">
                Datum &quot;do&quot; ne more biti pred datumom &quot;od&quot;.
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

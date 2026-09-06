'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  od: string;
  do: string;
  action?: string;
  submitLabel?: string;
}

/**
 * State lives in the URL so a checked period is linkable and shareable, and the server
 * does the computing. No Server Action needed.
 */
export function DateRangeForm({ od, do: doDate, action = '', submitLabel = 'Preveri' }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(od);
  const [to, setTo] = useState(doDate);

  const invalid = from > to;

  return (
    <form
      className="row g-2 align-items-end mb-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (invalid) return;
        router.push(`${action}?od=${from}&do=${to}`);
      }}
    >
      <div className="col-auto">
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
      <div className="col-auto">
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
      <div className="col-auto">
        <button className="btn btn-primary" type="submit" disabled={invalid}>
          {submitLabel}
        </button>
      </div>
      {invalid && (
        <div className="col-12">
          <div className="text-danger small">Datum &quot;do&quot; ne more biti pred datumom &quot;od&quot;.</div>
        </div>
      )}
    </form>
  );
}

import { eachDay, formatSl, startOfWeek, type IsoDate } from '@/lib/dates';
import type { ItemRow } from '@/lib/inventory/queries';

export interface TimelineRow {
  loanId: number;
  itemId: number;
  quantity: number;
  fromDate: string;
  toDate: string;
  borrowerName: string;
}

interface Props {
  oprema: readonly ItemRow[];
  rows: readonly TimelineRow[];
  from: string;
  to: string;
  danes: string;
}

// Two letters, because single letters collide three ways in Slovenian: ponedeljek and
// petek both start with P, and sreda, sobota and četrtek leave S and Č ambiguous.
const DNEVI = ['Ne', 'Po', 'To', 'Sr', 'Če', 'Pe', 'So'];

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

function dayOfWeek(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = nedelja
}

function isWeekend(date: IsoDate): boolean {
  const dow = dayOfWeek(date);
  return dow === 0 || dow === 6;
}

/**
 * A six-week strip shows "31, 01, 02 …" with no other clue about which month those days
 * belong to. The band groups the run into labelled months so the columns can be read.
 */
function monthSpans(days: readonly IsoDate[]): { label: string; span: number }[] {
  const out: { label: string; span: number }[] = [];
  for (const day of days) {
    const [y, m] = day.split('-').map(Number);
    const label = `${MESECI[m - 1]} ${y}`;
    const last = out[out.length - 1];
    if (last && last.label === label) last.span += 1;
    else out.push({ label, span: 1 });
  }
  return out;
}

/**
 * A range usually starts mid-month, leaving a stub of one or two days. "september 2026"
 * does not fit in 56px and spills over the neighbouring columns, so the stub gets the
 * three-letter form, or nothing at all when even that would not fit.
 */
function monthLabel(label: string, span: number): string {
  if (span >= 5) return label;
  if (span >= 2) return label.slice(0, 3);
  return '';
}

/** Pure server render - no client JS at all. */
export function TimelineGrid({ oprema, rows, from, to, danes }: Props) {
  const days = eachDay(from, to);
  const months = monthSpans(days);

  const byItem = new Map<number, TimelineRow[]>();
  for (const r of rows) {
    const list = byItem.get(r.itemId) ?? [];
    list.push(r);
    byItem.set(r.itemId, list);
  }

  function dayClass(day: IsoDate): string {
    return [
      'koledar-dan',
      day === startOfWeek(day) ? 'koledar-teden' : '',
      isWeekend(day) ? 'koledar-vikend' : '',
      day === danes ? 'koledar-danes' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return (
    <div className="table-responsive">
      {/* Bootstrap's `.table` is `width: 100%`, and under `table-layout: fixed` that
          makes 42 day columns share whatever space there is - on a phone they collapse
          to a few pixels and the labels overlap. Asking for the full width the columns
          need is what lets `.table-responsive` scroll instead. */}
      <table
        className="table table-bordered koledar"
        style={{ minWidth: `calc(9rem + ${days.length} * 28px)` }}
      >
        <caption className="visually-hidden">
          Zasedenost opreme po dnevih od {formatSl(from)} do {formatSl(to)}
        </caption>
        <thead>
          <tr>
            <th className="koledar-oprema koledar-mesec" />
            {months.map((m) => (
              <th key={m.label} className="koledar-mesec" colSpan={m.span}>
                <span title={m.label}>{monthLabel(m.label, m.span)}</span>
              </th>
            ))}
          </tr>
          <tr>
            <th className="koledar-oprema">Oprema</th>
            {days.map((day) => (
              <th key={day} className={dayClass(day)} title={formatSl(day)}>
                {Number(day.slice(8))}
              </th>
            ))}
          </tr>
          <tr>
            <th className="koledar-oprema text-secondary fw-normal" />
            {days.map((day) => (
              <th key={day} className={`${dayClass(day)} text-secondary fw-normal`}>
                {DNEVI[dayOfWeek(day)]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {oprema.map((item) => {
            const itemRows = byItem.get(item.id) ?? [];
            return (
              <tr key={item.id}>
                <th scope="row" className="koledar-oprema fw-normal">
                  {item.name} <span className="text-secondary">({item.totalQuantity})</span>
                </th>
                {days.map((day) => {
                  const active = itemRows.filter((r) => r.fromDate <= day && day <= r.toDate);
                  const used = active.reduce((sum, r) => sum + r.quantity, 0);

                  const bg =
                    used === 0
                      ? ''
                      : used >= item.totalQuantity
                        ? 'bg-danger-subtle'
                        : 'bg-warning-subtle';

                  const title =
                    used === 0
                      ? formatSl(day)
                      : `${formatSl(day)}: ${used}/${item.totalQuantity} – ${active
                          .map((r) => `${r.borrowerName} (#${r.loanId})`)
                          .join(', ')}`;

                  return (
                    <td key={day} className={`${dayClass(day)} ${bg}`} title={title}>
                      {used === 0 ? '' : used}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TimelineLegend() {
  return (
    <div className="koledar-legenda">
      <span>
        <span className="swatch" style={{ background: 'var(--bs-body-bg)' }} />
        prosto
      </span>
      <span>
        <span className="swatch" style={{ background: 'var(--bs-warning-bg-subtle)' }} />
        delno zasedeno
      </span>
      <span>
        <span className="swatch" style={{ background: 'var(--bs-danger-bg-subtle)' }} />
        vse zasedeno
      </span>
      <span>
        <span className="swatch" style={{ background: 'var(--bs-tertiary-bg)' }} />
        vikend
      </span>
      <span>
        <i className="bi bi-info-circle me-1" aria-hidden="true" />
        Številka v celici je število zasedenih kosov.
      </span>
    </div>
  );
}

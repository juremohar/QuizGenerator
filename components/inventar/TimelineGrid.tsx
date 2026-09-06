import { eachDay, formatSl, startOfWeek } from '@/lib/dates';
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

const DNEVI = ['N', 'P', 'T', 'S', 'Č', 'P', 'S'];

function weekday(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return DNEVI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Pure server render - no client JS at all. */
export function TimelineGrid({ oprema, rows, from, to, danes }: Props) {
  const days = eachDay(from, to);

  const byItem = new Map<number, TimelineRow[]>();
  for (const r of rows) {
    const list = byItem.get(r.itemId) ?? [];
    list.push(r);
    byItem.set(r.itemId, list);
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered koledar mb-0">
        <thead>
          <tr>
            <th className="koledar-oprema">Oprema</th>
            {days.map((day) => (
              <th
                key={day}
                className={`koledar-dan ${day === startOfWeek(day) ? 'koledar-teden' : ''}`}
                title={formatSl(day)}
              >
                {day.slice(8)}
              </th>
            ))}
          </tr>
          <tr>
            <th className="koledar-oprema text-secondary fw-normal">
              {formatSl(from)} – {formatSl(to)}
            </th>
            {days.map((day) => (
              <th
                key={day}
                className={`koledar-dan text-secondary fw-normal ${
                  day === startOfWeek(day) ? 'koledar-teden' : ''
                }`}
              >
                {weekday(day)}
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
                  {item.name}{' '}
                  <span className="text-secondary">({item.totalQuantity})</span>
                </th>
                {days.map((day) => {
                  const active = itemRows.filter((r) => r.fromDate <= day && day <= r.toDate);
                  const used = active.reduce((sum, r) => sum + r.quantity, 0);

                  const bg =
                    used === 0
                      ? day === danes
                        ? 'table-info'
                        : ''
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
                    <td
                      key={day}
                      className={`koledar-dan ${bg} ${
                        day === startOfWeek(day) ? 'koledar-teden' : ''
                      }`}
                      title={title}
                    >
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

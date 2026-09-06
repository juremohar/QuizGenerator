/**
 * Inclusive calendar date as 'YYYY-MM-DD'.
 *
 * ISO-8601 dates sort lexicographically iff they sort chronologically, so plain string
 * comparison is exact and free. NEVER `new Date(iso)` for comparison: that parses as
 * UTC midnight and mixing it with local-time accessors produces off-by-one bugs that
 * only appear at certain times of day.
 */
export type IsoDate = string;

const LJUBLJANA = 'Europe/Ljubljana';

/**
 * "Today" on the Ljubljana wall clock.
 *
 * Vercel functions run in UTC, so `new Date().toISOString().slice(0, 10)` is wrong for
 * the first 1-2 hours of every Slovenian day - which would make the evening "Zamuja"
 * list a day stale, exactly the kind of bug that erodes trust in the tool.
 * 'sv-SE' reliably formats as YYYY-MM-DD.
 */
export function todayLjubljana(now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: LJUBLJANA }).format(now);
}

/** Day arithmetic done entirely in UTC so DST transitions cannot interfere. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) + days * 86_400_000);
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mm}-${dd}`;
}

/** Inclusive day count: '2026-09-01'..'2026-09-03' is 3 days. */
export function daysInclusive(from: IsoDate, to: IsoDate): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const ms = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);
  return Math.floor(ms / 86_400_000) + 1;
}

/** Every date in [from, to], inclusive at both ends. */
export function eachDay(from: IsoDate, to: IsoDate): IsoDate[] {
  if (from > to) return [];
  const out: IsoDate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function isIsoDate(value: unknown): value is IsoDate {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** 1. 9. 2026 - Slovenian convention. */
export function formatSl(date: IsoDate): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${d}. ${m}. ${y}`;
}

export function formatRangeSl(from: IsoDate, to: IsoDate): string {
  return from === to ? formatSl(from) : `${formatSl(from)} – ${formatSl(to)}`;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: IsoDate): IsoDate {
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun
  return addDays(date, dow === 0 ? -6 : 1 - dow);
}

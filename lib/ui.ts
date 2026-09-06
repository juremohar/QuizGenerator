/**
 * Shared Tailwind class strings.
 *
 * Utility classes are great until the same eleven-class button string is pasted into
 * twenty files and they drift. These helpers are the single definition of what a button
 * or a field looks like. Plain functions rather than React components on purpose: the
 * same string has to work on `<button>`, `<Link>` and `<a>`, and a wrapper component for
 * each would be more code and less flexible.
 */

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'dangerSoft'
  | 'success'
  | 'ghost';

export type ButtonSize = 'sm' | 'md';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
  'transition-colors cursor-pointer select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

// 44px / 36px: the small size is for controls sitting inside a table row, where a
// full-height button would blow the row open. Anything a thumb needs to hit is `md`.
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
};

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // Near-black rather than a brand red: red has to stay meaningful as "something is
  // wrong", and a red primary button on every screen destroys that.
  primary: 'bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerSoft: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

export function btn(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cx(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_VARIANT[variant], className);
}

export const card = 'rounded-xl border border-slate-200 bg-white';
export const cardHeader =
  'flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 ' +
  'text-sm font-semibold text-slate-900';
export const cardBody = 'p-4';

// 16px on the input itself, because iOS Safari zooms the viewport on focus for anything
// smaller and the user is left scrolled sideways on a form.
export const field =
  'block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base ' +
  'text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:outline-none ' +
  'disabled:bg-slate-50';

export const fieldInvalid = 'border-red-400 focus:border-red-500 focus:ring-red-500/10';

export const label = 'mb-1.5 block text-sm font-medium text-slate-700';
export const help = 'mt-1.5 text-sm text-slate-500';
export const errorText = 'mt-1.5 text-sm text-red-600';

export type BadgeTone = 'slate' | 'red' | 'amber' | 'emerald' | 'blue' | 'dark';

const BADGE_TONE: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  dark: 'bg-slate-800 text-white ring-slate-700',
};

export function badge(tone: BadgeTone = 'slate', className?: string): string {
  return cx(
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
    BADGE_TONE[tone],
    className,
  );
}

export const link = 'text-blue-700 underline-offset-2 hover:underline';

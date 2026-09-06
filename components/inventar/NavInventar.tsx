'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { odjava } from '@/app/inventar/actions';
import type { Actor } from '@/lib/auth-guard';
import { cx } from '@/lib/ui';

interface Povezava {
  href: string;
  label: string;
  /** Shorter label for the phone tab bar, where five items share the screen width. */
  kratko?: string;
  icon: string;
}

const POVEZAVE: Povezava[] = [
  { href: '/inventar', label: 'Pregled', icon: 'bi-speedometer2' },
  {
    href: '/inventar/razpolozljivost',
    label: 'Razpoložljivost',
    kratko: 'Prosto',
    icon: 'bi-clipboard-check',
  },
  { href: '/inventar/izposoje', label: 'Izposoje', icon: 'bi-box-arrow-right' },
  { href: '/inventar/koledar', label: 'Koledar', icon: 'bi-calendar3' },
  { href: '/inventar/oprema', label: 'Oprema', icon: 'bi-boxes' },
];

/**
 * Client component only so the current tab can be highlighted: without it every tab
 * looked identical and there was no way to tell which page you were on.
 * `/inventar` matches exactly, the rest match their whole subtree so a detail page
 * still highlights its section.
 */
function isActive(pathname: string, href: string): boolean {
  return href === '/inventar' ? pathname === href : pathname.startsWith(href);
}

export function NavInventar({ actor }: { actor: Actor }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b-[3px] border-brand bg-slate-900 text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-2.5 md:pb-0">
          <Link
            href="/inventar"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-white"
          >
            <i className="bi bi-fire text-brand text-lg" aria-hidden="true" />
            <span className="truncate max-sm:hidden">Inventar PGD Veliko Mlačevo</span>
            <span className="truncate sm:hidden">Inventar PGD</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <span className="max-w-40 truncate text-sm text-slate-400 max-lg:hidden">
              {actor.name ?? actor.email}
            </span>
            <Link
              href="/"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <i className="bi bi-mortarboard" aria-hidden="true" />
              <span className="max-md:hidden">Kviz</span>
            </Link>
            <form action={odjava}>
              <button
                type="submit"
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span className="max-sm:hidden">Odjava</span>
              </button>
            </form>
          </div>
        </div>

        {/* Desktop only: on a phone this strip could show three of five tabs and the rest
            scrolled off with no affordance, so navigation moves to the bar below. */}
        <nav aria-label="Inventar" className="mx-auto w-full max-w-6xl px-4 max-md:hidden">
          <div className="flex gap-1">
            {POVEZAVE.map((p) => {
              const active = isActive(pathname, p.href);
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'inline-flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-[3px] px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'border-brand bg-white/10 font-semibold text-white'
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <i className={`bi ${p.icon}`} aria-hidden="true" />
                  {p.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Phone: a fixed bottom bar. All five destinations are visible at once, nothing
          scrolls out of reach, and they sit where a thumb actually is. `pb-safe` keeps
          the labels clear of the iOS home indicator. */}
      <nav
        aria-label="Inventar"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {POVEZAVE.map((p) => {
          const active = isActive(pathname, p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={active ? 'page' : undefined}
              aria-label={p.label}
              className={cx(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                active ? 'font-semibold text-slate-900' : 'text-slate-500',
              )}
            >
              <i
                className={cx(`bi ${p.icon} text-lg`, active && 'text-brand')}
                aria-hidden="true"
              />
              {p.kratko ?? p.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

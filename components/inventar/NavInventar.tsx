'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { odjava } from '@/app/inventar/actions';
import type { Actor } from '@/lib/auth-guard';
import { cx } from '@/lib/ui';

const POVEZAVE = [
  { href: '/inventar', label: 'Pregled', icon: 'bi-speedometer2' },
  { href: '/inventar/razpolozljivost', label: 'Razpoložljivost', icon: 'bi-clipboard-check' },
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
export function NavInventar({ actor }: { actor: Actor }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    return href === '/inventar' ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-brand bg-slate-900 text-white">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between gap-2 pt-2.5">
          <Link
            href="/inventar"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-white"
          >
            <i className="bi bi-fire text-brand text-lg" aria-hidden="true" />
            <span className="truncate max-sm:hidden">Inventar PGD Veliko Mlačevo</span>
            <span className="truncate sm:hidden">Inventar PGD</span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            {/* The name is context, not a control: it is the first thing to drop when
                the header gets tight. */}
            <span className="max-w-40 truncate text-sm text-slate-400 max-md:hidden">
              {actor.name ?? actor.email}
            </span>
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

        {/* Scrolls sideways on a narrow phone instead of wrapping into a ragged block.
            The scrollbar is hidden because the strip is also swipeable. */}
        <nav
          aria-label="Inventar"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {POVEZAVE.map((p) => {
            const active = isActive(p.href);
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg border-b-[3px] px-3 py-2.5 text-sm transition-colors',
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
          <Link
            href="/"
            className="ms-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg border-b-[3px] border-transparent px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <i className="bi bi-mortarboard" aria-hidden="true" />
            Kviz
          </Link>
        </nav>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { odjava } from '@/app/inventar/actions';
import type { Actor } from '@/lib/auth-guard';

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
    <header className="inv-header mb-4">
      <div>
        <div className="d-flex justify-content-between align-items-center gap-2 pt-2 pb-1">
          <Link className="inv-brand text-truncate" href="/inventar">
            <i className="bi bi-fire me-2" aria-hidden="true" />
            <span className="d-none d-sm-inline">Inventar PGD Veliko Mlačevo</span>
            <span className="d-sm-none">Inventar PGD</span>
          </Link>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {/* The name is context, not a control: it is the first thing to drop when
                the header gets tight. */}
            <span className="inv-user small d-none d-md-inline text-truncate">
              {actor.name ?? actor.email}
            </span>
            <form action={odjava}>
              <button type="submit" className="btn btn-sm btn-outline-light">
                <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                <span className="d-none d-sm-inline">Odjava</span>
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Inventar">
          <div className="inv-tabs">
            {POVEZAVE.map((p) => {
              const active = isActive(p.href);
              return (
                <Link
                  key={p.href}
                  className={`inv-tab ${active ? 'active' : ''}`}
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={`bi ${p.icon}`} aria-hidden="true" />
                  {p.label}
                </Link>
              );
            })}
            <Link className="inv-tab ms-auto" href="/">
              <i className="bi bi-mortarboard" aria-hidden="true" />
              Kviz
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

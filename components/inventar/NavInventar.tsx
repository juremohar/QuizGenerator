import Link from 'next/link';

import { odjava } from '@/app/inventar/actions';
import type { Actor } from '@/lib/auth-guard';

const POVEZAVE = [
  { href: '/inventar', label: 'Pregled' },
  { href: '/inventar/razpolozljivost', label: 'Razpoložljivost' },
  { href: '/inventar/izposoje', label: 'Izposoje' },
  { href: '/inventar/koledar', label: 'Koledar' },
  { href: '/inventar/oprema', label: 'Oprema' },
];

export function NavInventar({ actor }: { actor: Actor }) {
  return (
    <header className="border-bottom mb-4 pt-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong className="fs-5">Inventar PGD Veliko Mlačevo</strong>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary small">{actor.name ?? actor.email}</span>
          <form action={odjava}>
            <button type="submit" className="btn btn-sm btn-outline-secondary">
              Odjava
            </button>
          </form>
        </div>
      </div>

      <nav>
        <ul className="nav nav-pills py-2">
          {POVEZAVE.map((p) => (
            <li className="nav-item" key={p.href}>
              <Link className="nav-link" href={p.href}>
                {p.label}
              </Link>
            </li>
          ))}
          <li className="nav-item ms-auto">
            <Link className="nav-link" href="/">
              Kviz
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

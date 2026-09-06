import type { Metadata } from 'next';
import Link from 'next/link';

import { btn } from '@/lib/ui';
import { prijavaGoogle } from './actions';

export const metadata: Metadata = { title: 'Prijava – Inventar' };

/**
 * Mapping AccessDenied is not cosmetic: without it, someone whose account is not on the
 * allowlist lands on a page with no explanation and reports the site as broken.
 */
const NAPAKE: Record<string, string> = {
  AccessDenied:
    'Vaš Google račun ni na seznamu dovoljenih uporabnikov. Za dostop se obrnite na upravitelja.',
  Configuration: 'Napaka v nastavitvah prijave. Obvestite upravitelja.',
  Verification: 'Povezava za prijavo je potekla. Poskusite znova.',
};

type Props = { searchParams: Promise<{ error?: string; callbackUrl?: string }> };

export default async function PrijavaPage({ searchParams }: Props) {
  const { error, callbackUrl } = await searchParams;
  const sporocilo = error ? (NAPAKE[error] ?? 'Prijava ni uspela. Poskusite znova.') : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-brand">
          <i className="bi bi-fire text-2xl" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            PGD Veliko Mlačevo
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Prijava</h1>
        <p className="mt-2 text-sm text-slate-500">
          Za dostop do inventarja se prijavite z Google računom.
        </p>

        {sporocilo && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {sporocilo}
          </div>
        )}

        <form action={prijavaGoogle} className="mt-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/inventar'} />
          <button type="submit" className={btn('primary', 'md', 'w-full')}>
            <i className="bi bi-google" aria-hidden="true" /> Prijava z Google računom
          </button>
        </form>

        <div className="mt-5">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Nazaj na kviz
          </Link>
        </div>
      </div>
    </main>
  );
}

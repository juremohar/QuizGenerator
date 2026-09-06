import type { Metadata } from 'next';
import Link from 'next/link';

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
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm" style={{ maxWidth: '28rem', width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="fs-3 mb-3">Prijava</h1>
          <p className="text-secondary">
            Za dostop do inventarja se prijavite z Google računom.
          </p>

          {sporocilo && (
            <div className="alert alert-danger" role="alert">
              {sporocilo}
            </div>
          )}

          <form action={prijavaGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/inventar'} />
            <button type="submit" className="btn btn-primary btn-lg w-100">
              <i className="bi bi-google me-2" /> Prijava z Google računom
            </button>
          </form>

          <div className="mt-3">
            <Link href="/" className="link-secondary">
              ← Nazaj na kviz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

import { btn } from '@/lib/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Stran ne obstaja</h1>
      <p className="text-slate-500">Iskana stran ni bila najdena.</p>
      <Link className={btn('primary')} href="/">
        Domov
      </Link>
    </main>
  );
}

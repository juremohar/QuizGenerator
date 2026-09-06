import Link from 'next/link';

import { KATEGORIJE, KVIZI } from '@/lib/quiz/config';
import { btn } from '@/lib/ui';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-900">
        Gasilski kviz
      </h1>

      <div className="grid gap-6 sm:grid-cols-3">
        {KATEGORIJE.map((slug) => {
          const cfg = KVIZI[slug];
          return (
            <div
              key={slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Plain <img>: these badges are small, shown at a fixed size, and have no
                  declared intrinsic dimensions, so next/image would buy nothing. */}
              <img src={cfg.znacka} alt={cfg.kartica} className="w-full" />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold text-slate-900">{cfg.kartica}</h2>
                <p className="mt-1 mb-4 flex-1 text-sm text-slate-500">{cfg.opis}</p>
                {/* prefetch={false}: the quiz route is force-dynamic, so hover-prefetch
                    would build a quiz nobody asked for. */}
                <Link className={btn('primary', 'md', 'w-full')} href={`/${slug}/kviz`} prefetch={false}>
                  Kviz
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link className={btn('secondary')} href="/literatura">
          <i className="bi bi-book" aria-hidden="true" />
          Literatura
        </Link>
      </div>
    </main>
  );
}

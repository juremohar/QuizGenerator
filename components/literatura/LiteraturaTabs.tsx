'use client';

import { useState } from 'react';
import Link from 'next/link';

import { KATEGORIJE, type Kategorija } from '@/lib/quiz/config';
import { LITERATURA, LITERATURA_OPIS } from '@/lib/literature';
import { btn, cx } from '@/lib/ui';

function FileList({ kategorija }: { kategorija: Kategorija }) {
  const { naslov, opis } = LITERATURA_OPIS[kategorija];
  const files = LITERATURA.filter((f) => f.kategorija === kategorija);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900">{naslov}</h2>
      <p className="mt-1 mb-3 text-sm text-slate-500">{opis}</p>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {files.map((f) => (
          <li key={f.href}>
            <a
              href={f.href}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <i className="bi bi-file-earmark-pdf text-lg text-red-600" aria-hidden="true" />
              <span className="flex-1">{f.name}</span>
              <i className="bi bi-box-arrow-up-right text-slate-300" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

const TAB =
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition-colors';
const TAB_ON = 'border-slate-900 bg-slate-900 text-white';
const TAB_OFF = 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50';

export function LiteraturaTabs() {
  const [currentTab, setCurrentTab] = useState<Kategorija | null>(null);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Literatura</h1>
        {/* Was href="#" and, oddly, also set the tab to Pripravnik. */}
        <Link className={btn('secondary')} href="/">
          Domov
        </Link>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-pressed={currentTab === null}
          className={cx(TAB, currentTab === null ? TAB_ON : TAB_OFF)}
          onClick={() => setCurrentTab(null)}
        >
          Vse
        </button>
        {KATEGORIJE.map((slug) => (
          <button
            key={slug}
            type="button"
            aria-pressed={currentTab === slug}
            className={cx(TAB, currentTab === slug ? TAB_ON : TAB_OFF)}
            onClick={() => setCurrentTab(slug)}
          >
            {LITERATURA_OPIS[slug].naslov}
          </button>
        ))}
      </div>

      {currentTab === null ? (
        KATEGORIJE.map((slug) => <FileList key={slug} kategorija={slug} />)
      ) : (
        <FileList kategorija={currentTab} />
      )}
    </main>
  );
}

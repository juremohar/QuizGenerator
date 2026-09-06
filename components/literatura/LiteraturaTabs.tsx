'use client';

import { useState } from 'react';
import Link from 'next/link';

import { KATEGORIJE, type Kategorija } from '@/lib/quiz/config';
import { LITERATURA, LITERATURA_OPIS } from '@/lib/literature';

function FileList({ kategorija }: { kategorija: Kategorija }) {
  const { naslov, opis } = LITERATURA_OPIS[kategorija];

  return (
    <div>
      <h6>{naslov}</h6>
      <div>{opis}</div>
      <div className="row">
        <ul>
          {LITERATURA.filter((f) => f.kategorija === kategorija).map((f) => (
            <li key={f.href}>
              <a href={f.href} target="_blank" rel="noopener">
                <i className="bi bi-file-earmark-pdf" /> {f.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LiteraturaTabs() {
  const [currentTab, setCurrentTab] = useState<Kategorija | null>(null);

  return (
    <div>
      <ul className="nav nav-pills p-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${currentTab === null ? 'active' : ''}`}
            onClick={() => setCurrentTab(null)}
          >
            Vse
          </button>
        </li>
        {KATEGORIJE.map((slug) => (
          <li className="nav-item" key={slug}>
            <button
              type="button"
              className={`nav-link ${currentTab === slug ? 'active' : ''}`}
              onClick={() => setCurrentTab(slug)}
            >
              {LITERATURA_OPIS[slug].naslov}
            </button>
          </li>
        ))}
        <li className="nav-item">
          {/* Was href="#" and, oddly, also set the tab to Pripravnik. */}
          <Link className="nav-link" href="/">
            Domov
          </Link>
        </li>
      </ul>

      {currentTab === null ? (
        <>
          {KATEGORIJE.map((slug) => (
            <FileList key={slug} kategorija={slug} />
          ))}
        </>
      ) : (
        <FileList kategorija={currentTab} />
      )}
    </div>
  );
}

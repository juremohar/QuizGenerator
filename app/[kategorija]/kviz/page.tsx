import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import { KVIZI, isKategorija } from '@/lib/quiz/config';
import { buildQuizForKategorija } from '@/lib/quiz/data.server';
import { btn } from '@/lib/ui';
import { QuizSections } from '@/components/quiz/QuizSections';
import { NovKvizButton } from '@/components/quiz/NovKvizButton';

/**
 * Never cached: the quiz must reshuffle on every visit, matching the old app where every
 * mount regenerated. `generateStaticParams` is deliberately absent - it would be a no-op
 * under force-dynamic and would mislead the next reader. The `isKategorija` type guard
 * validates the slug and gives exhaustive typing on KVIZI[kategorija] for free.
 */
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ kategorija: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorija } = await params;
  if (!isKategorija(kategorija)) return {};
  return { title: `${KVIZI[kategorija].naslov} – Gasilski kviz` };
}

export default async function KvizPage({ params }: Props) {
  // Next 16: params is a Promise; synchronous access was removed.
  const { kategorija } = await params;
  if (!isKategorija(kategorija)) notFound();

  const cfg = KVIZI[kategorija];
  const quiz = buildQuizForKategorija(cfg);
  // A new key on every server render remounts the client subtree, so answers can never
  // desync from a freshly shuffled set of questions.
  const runId = crypto.randomUUID();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{cfg.naslov}</h1>
        <div className="flex gap-2">
          <NovKvizButton />
          <Link className={btn('secondary')} href="/">
            Domov
          </Link>
        </div>
      </div>

      <QuizSections key={runId} sections={quiz.sections} />
    </main>
  );
}

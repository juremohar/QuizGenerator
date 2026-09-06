import 'server-only';

import vesNeves from '@/data/ves_neves.json';
import zgodovina from '@/data/zgodovina.json';
import vescine from '@/data/vescine.json';
import oznake from '@/data/oznake.json';
import prvaPomoc from '@/data/prva_pomoc.json';

import { buildQuiz } from './questions';
import type { Pools, QuizData, RawQuestion } from './types';
import type { KategorijaConfig } from './config';

/**
 * `import 'server-only'` is the mechanism that keeps ~148 KB of question JSON - and
 * every correct answer - out of the client bundle. An accidental import from a
 * 'use client' file becomes a build error rather than silent bundle bloat.
 *
 * It also throws outside an RSC environment, which is exactly why the pure builder
 * lives in questions.ts: Vitest can import that, but never this.
 */
export const POOLS: Pools = {
  ves_neves: vesNeves as readonly RawQuestion[],
  zgodovina: zgodovina as readonly RawQuestion[],
  vescine: vescine as readonly RawQuestion[],
  oznake: oznake as readonly RawQuestion[],
  prva_pomoc: prvaPomoc as readonly RawQuestion[],
};

export function buildQuizForKategorija(cfg: KategorijaConfig): QuizData {
  return buildQuiz(cfg, POOLS);
}

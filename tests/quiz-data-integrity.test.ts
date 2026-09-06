import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { KATEGORIJE, KVIZI } from '@/lib/quiz/config';
import { LITERATURA } from '@/lib/literature';
import type { Field, RawQuestion } from '@/lib/quiz/types';

import vesNeves from '@/data/ves_neves.json';
import zgodovina from '@/data/zgodovina.json';
import vescine from '@/data/vescine.json';
import oznake from '@/data/oznake.json';
import prvaPomoc from '@/data/prva_pomoc.json';

const ROOT = path.resolve(__dirname, '..');

const FILES: Record<Field, readonly RawQuestion[]> = {
  ves_neves: vesNeves as readonly RawQuestion[],
  zgodovina: zgodovina as readonly RawQuestion[],
  vescine: vescine as readonly RawQuestion[],
  oznake: oznake as readonly RawQuestion[],
  prva_pomoc: prvaPomoc as readonly RawQuestion[],
};

const rawQuestionSchema = z.object({
  question: z.string().min(1),
  correctAnswer: z.string().min(1),
  wrongAnswers: z.array(z.string().min(1)).min(1),
  ages: z.array(z.enum(['pionir', 'mladinec', 'pripravnik'])).min(1),
  source: z.string().min(1).optional(),
});

describe.each(Object.keys(FILES) as Field[])('data/%s.json', (field) => {
  const questions = FILES[field];

  it('matches the expected question schema', () => {
    for (const q of questions) {
      const parsed = rawQuestionSchema.safeParse(q);
      expect(parsed.success, `${field}: ${JSON.stringify(q).slice(0, 120)}`).toBe(true);
    }
  });

  it('never lists the correct answer among the wrong answers', () => {
    for (const q of questions) {
      expect(q.wrongAnswers).not.toContain(q.correctAnswer);
    }
  });

  it('references only images that exist on disk', () => {
    for (const q of questions) {
      if (!q.source) continue;
      const file = path.join(ROOT, 'public', 'images', field, q.source);
      expect(existsSync(file), `manjka slika: public/images/${field}/${q.source}`).toBe(true);
    }
  });
});

// The test that would have caught the empty Pripravniki / Prva pomoč section.
describe('every quiz section has enough questions to fill it', () => {
  it.each(KATEGORIJE)('%s', (kategorija) => {
    for (const section of KVIZI[kategorija].sections) {
      const pool = section.fields.flatMap((f) =>
        FILES[f].filter((q) => section.starosti.some((s) => q.ages.includes(s))),
      );
      expect(
        pool.length,
        `${kategorija} / ${section.naslov} ima samo ${pool.length} vprašanj`,
      ).toBeGreaterThanOrEqual(section.count);
    }
  });

  // "Drži/ne drži" and "Požarna preventiva" share fields, so the pools must also be
  // big enough once the first section has consumed its questions.
  it.each(KATEGORIJE)('%s has enough questions for overlapping sections combined', (kategorija) => {
    const sections = KVIZI[kategorija].sections;
    const perField = new Map<string, number>();

    for (const section of sections) {
      const key = [...section.fields].sort().join('+') + '|' + [...section.starosti].sort().join('+');
      const pool = section.fields.flatMap((f) =>
        FILES[f].filter((q) => section.starosti.some((s) => q.ages.includes(s))),
      );
      perField.set(key, (perField.get(key) ?? 0) + section.count);
      expect(pool.length).toBeGreaterThanOrEqual(perField.get(key)!);
    }
  });
});

describe('literature PDFs', () => {
  it('all exist on disk', () => {
    for (const file of LITERATURA) {
      const onDisk = path.join(ROOT, 'public', file.href.replace(/^\//, ''));
      expect(existsSync(onDisk), `manjka PDF: ${file.href}`).toBe(true);
    }
  });
});

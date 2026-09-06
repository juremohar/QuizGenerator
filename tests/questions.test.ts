import { describe, expect, it } from 'vitest';
import { buildQuiz } from '@/lib/quiz/questions';
import { KVIZI, type Kategorija } from '@/lib/quiz/config';
import type { Pools, RawQuestion } from '@/lib/quiz/types';

import vesNeves from '@/data/ves_neves.json';
import zgodovina from '@/data/zgodovina.json';
import vescine from '@/data/vescine.json';
import oznake from '@/data/oznake.json';
import prvaPomoc from '@/data/prva_pomoc.json';

const POOLS: Pools = {
  ves_neves: vesNeves as readonly RawQuestion[],
  zgodovina: zgodovina as readonly RawQuestion[],
  vescine: vescine as readonly RawQuestion[],
  oznake: oznake as readonly RawQuestion[],
  prva_pomoc: prvaPomoc as readonly RawQuestion[],
};

const KATEGORIJE: Kategorija[] = ['pionirji', 'mladinci', 'pripravniki'];

describe('buildQuiz', () => {
  it('never mutates the question data', () => {
    const before = structuredClone(POOLS);
    for (const k of KATEGORIJE) {
      buildQuiz(KVIZI[k], POOLS);
      buildQuiz(KVIZI[k], POOLS);
    }
    expect(POOLS).toEqual(before);
  });

  it('does not add a `field` key to any source question', () => {
    buildQuiz(KVIZI.pripravniki, POOLS);
    const all = Object.values(POOLS).flat();
    expect(all.some((q) => 'field' in (q as object))).toBe(false);
  });

  // The regression guard for the Pripravniki bug: the naive Mladinec -> Pripravnik
  // swap would leave "Prva pomoč" empty, because prva_pomoc.json has no
  // pripravnik-tagged questions.
  it.each(KATEGORIJE)('gives %s a full set of questions in every section', (kategorija) => {
    const quiz = buildQuiz(KVIZI[kategorija], POOLS);
    expect(quiz.sections).toHaveLength(3);
    for (const section of quiz.sections) {
      expect(section.questions, `${kategorija} / ${section.naslov}`).toHaveLength(10);
    }
  });

  it.each(KATEGORIJE)('only uses age-appropriate questions for %s', (kategorija) => {
    const cfg = KVIZI[kategorija];
    const quiz = buildQuiz(cfg, POOLS);

    for (let i = 0; i < cfg.sections.length; i++) {
      const section = cfg.sections[i];
      const eligible = new Set(
        section.fields.flatMap((f) =>
          POOLS[f]
            .filter((q) => section.starosti.some((s) => q.ages.includes(s)))
            .map((q) => q.question),
        ),
      );
      for (const q of quiz.sections[i].questions) {
        expect(eligible.has(q.question)).toBe(true);
      }
    }
  });

  it.each(KATEGORIJE)('never repeats a question across sections for %s', (kategorija) => {
    const quiz = buildQuiz(KVIZI[kategorija], POOLS);
    const keys = quiz.sections.flatMap((s) => s.questions.map((q) => q.key));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('always includes the correct answer among multiple-choice options', () => {
    for (const k of KATEGORIJE) {
      const quiz = buildQuiz(KVIZI[k], POOLS);
      for (const section of quiz.sections) {
        for (const q of section.questions) {
          if (q.kind !== 'multipleChoice') continue;
          expect(q.answers).toContain(q.correctAnswer);
          expect(new Set(q.answers).size).toBe(q.answers.length);
          expect(q.answers.length).toBeGreaterThanOrEqual(2);
          expect(q.answers.length).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('shows either the correct answer or a real wrong answer in true/false', () => {
    const cfg = KVIZI.pionirji;
    const alwaysCorrect = buildQuiz(cfg, POOLS, () => 0.1);
    for (const q of alwaysCorrect.sections[0].questions) {
      if (q.kind !== 'trueFalse') continue;
      expect(q.shownAnswer).toBe(q.correctAnswer);
    }

    const alwaysWrong = buildQuiz(cfg, POOLS, () => 0.9);
    for (const q of alwaysWrong.sections[0].questions) {
      if (q.kind !== 'trueFalse') continue;
      expect(q.shownAnswer).not.toBe(q.correctAnswer);
    }
  });

  it('builds image paths under /images/<field>/', () => {
    const quiz = buildQuiz(KVIZI.mladinci, POOLS);
    for (const section of quiz.sections) {
      for (const q of section.questions) {
        if (q.imageSrc === null) continue;
        expect(q.imageSrc).toMatch(/^\/images\/(ves_neves|zgodovina|vescine|oznake|prva_pomoc)\/.+/);
      }
    }
  });

  it('never offers the same answer twice, even when the data repeats a wrong answer', () => {
    const pools: Pools = {
      ...POOLS,
      prva_pomoc: [
        {
          question: 'Kako se imenuje preveza na sliki?',
          correctAnswer: 'Esmarchova preveza.',
          // The real defect in data/prva_pomoc.json: the same distractor listed twice.
          wrongAnswers: ['Emarchove preveze.', 'Emarchove preveze.'],
          ages: ['pionir'],
        },
      ],
    };
    const cfg = { ...KVIZI.pionirji, sections: [KVIZI.pionirji.sections[1]] };
    const q = buildQuiz(cfg, pools).sections[0].questions[0];

    expect(q.kind).toBe('multipleChoice');
    if (q.kind === 'multipleChoice') {
      expect(new Set(q.answers).size).toBe(q.answers.length);
      expect(q.answers).toHaveLength(2);
      expect(q.answers).toContain('Esmarchova preveza.');
    }
  });

  it('copes with a question that has only one wrong answer', () => {
    const pools: Pools = {
      ...POOLS,
      prva_pomoc: [
        {
          question: 'Samo en napačen odgovor?',
          correctAnswer: 'Da.',
          wrongAnswers: ['Ne.'],
          ages: ['pionir'],
        },
      ],
    };
    const cfg = {
      ...KVIZI.pionirji,
      sections: [KVIZI.pionirji.sections[1]],
    };
    const quiz = buildQuiz(cfg, pools);
    expect(quiz.sections[0].questions[0]).toMatchObject({ kind: 'multipleChoice' });
    const q = quiz.sections[0].questions[0];
    if (q.kind === 'multipleChoice') expect(q.answers).toHaveLength(2);
  });
});

import { pickSample, shuffle, type Rnd } from './random';
import type {
  Field,
  Pools,
  QuizData,
  QuizQuestion,
  QuizSection,
  RawQuestion,
  SectionConfig,
} from './types';
import type { KategorijaConfig } from './config';

interface Candidate {
  readonly raw: RawQuestion;
  readonly field: Field;
  readonly key: string;
}

function imageSrc(raw: RawQuestion, field: Field): string | null {
  return raw.source ? `/images/${field}/${raw.source}` : null;
}

/**
 * Collect the eligible pool for one section.
 *
 * Note what this does NOT do: the old helper wrote `q.field = field` onto the
 * question object, mutating the cached JSON module. In a browser SPA that was a
 * curiosity; on a warm serverless instance the mutation would persist across other
 * users' requests. The field is carried on a wrapper instead.
 */
function poolFor(section: SectionConfig, pools: Pools): Candidate[] {
  const out: Candidate[] = [];
  for (const field of section.fields) {
    const questions = pools[field] ?? [];
    for (let i = 0; i < questions.length; i++) {
      const raw = questions[i];
      if (!section.starosti.some((s) => raw.ages.includes(s))) continue;
      out.push({ raw, field, key: `${field}:${i}` });
    }
  }
  return out;
}

function buildTrueFalse(c: Candidate, rnd: Rnd): QuizQuestion {
  const showCorrect = rnd() < 0.5;
  const distinctWrong = Array.from(new Set(c.raw.wrongAnswers)).filter(
    (a) => a !== c.raw.correctAnswer,
  );
  const wrong = pickSample(distinctWrong, 1, rnd)[0];
  return {
    kind: 'trueFalse',
    key: c.key,
    question: c.raw.question,
    correctAnswer: c.raw.correctAnswer,
    // Preserves the original 50/50 semantics. Falls back to the correct answer if a
    // question somehow has no wrong answers at all, rather than rendering `undefined`.
    shownAnswer: showCorrect || wrong === undefined ? c.raw.correctAnswer : wrong,
    imageSrc: imageSrc(c.raw, c.field),
  };
}

function buildMultipleChoice(c: Candidate, rnd: Rnd): QuizQuestion {
  // Deduplicate before sampling. Two questions in ves_neves.json have only ONE wrong
  // answer, and prva_pomoc has one question whose two wrong answers are the same string
  // ("Emarchove preveze." twice) - which the old app rendered as two identical radio
  // options. Either way this degrades to 2 distinct options rather than showing a
  // duplicate or a blank choice.
  const distinctWrong = Array.from(new Set(c.raw.wrongAnswers)).filter(
    (a) => a !== c.raw.correctAnswer,
  );
  const wrong = pickSample(distinctWrong, 2, rnd);
  return {
    kind: 'multipleChoice',
    key: c.key,
    question: c.raw.question,
    correctAnswer: c.raw.correctAnswer,
    answers: shuffle([...wrong, c.raw.correctAnswer], rnd),
    imageSrc: imageSrc(c.raw, c.field),
  };
}

/**
 * Pure. Data and randomness are both injected, so this is fully unit-testable and
 * carries no `server-only` import (which would throw under Vitest).
 */
export function buildQuiz(cfg: KategorijaConfig, pools: Pools, rnd: Rnd = Math.random): QuizData {
  // Shared across sections: "Drži/ne drži" and "Požarna preventiva" draw from the same
  // fields, so without this the same question could appear twice in one quiz.
  const used = new Set<string>();
  const sections: QuizSection[] = [];

  for (const section of cfg.sections) {
    const available = poolFor(section, pools).filter((c) => !used.has(c.key));
    const chosen = pickSample(available, section.count, rnd);
    for (const c of chosen) used.add(c.key);

    sections.push({
      id: section.id,
      naslov: section.naslov,
      podnaslov: section.podnaslov,
      tip: section.tip,
      questions: chosen.map((c) =>
        section.tip === 'trueFalse' ? buildTrueFalse(c, rnd) : buildMultipleChoice(c, rnd),
      ),
    });
  }

  return { sections };
}

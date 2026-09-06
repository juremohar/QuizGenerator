'use client';

import { useState } from 'react';

import type { QuizSection, TrueFalseQuestion, MultipleChoiceQuestion } from '@/lib/quiz/types';
import { btn } from '@/lib/ui';
import { TrueFalseQuestionCard } from './TrueFalseQuestionCard';
import { MultipleChoiceQuestionCard } from './MultipleChoiceQuestionCard';

type Answer = boolean | string | null;

function scoreSection(section: QuizSection, answers: Answer[]): number {
  return section.questions.reduce((score, q, i) => {
    if (q.kind === 'trueFalse') {
      const shownIsCorrect = q.correctAnswer === q.shownAnswer;
      return score + (shownIsCorrect === answers[i] ? 1 : 0);
    }
    return score + (answers[i] === q.correctAnswer ? 1 : 0);
  }, 0);
}

function Section({ section }: { section: QuizSection }) {
  const [answers, setAnswers] = useState<Answer[]>(() => section.questions.map(() => null));
  const [showResults, setShowResults] = useState(false);

  function select(index: number, value: boolean | string) {
    if (showResults) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{section.naslov}</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">{section.podnaslov}</p>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {section.questions.map((question, index) =>
          question.kind === 'trueFalse' ? (
            <TrueFalseQuestionCard
              key={question.key}
              question={question as TrueFalseQuestion}
              questionNumber={index}
              userAnswer={answers[index] as boolean | null}
              showResults={showResults}
              onSelect={(value) => select(index, value)}
            />
          ) : (
            <MultipleChoiceQuestionCard
              key={question.key}
              question={question as MultipleChoiceQuestion}
              questionNumber={index}
              groupId={section.id}
              userAnswer={answers[index] as string | null}
              showResults={showResults}
              onSelect={(value) => select(index, value)}
            />
          ),
        )}
      </div>

      <button
        type="button"
        className={btn('primary', 'md', 'mt-4 max-sm:w-full')}
        disabled={showResults}
        onClick={() => setShowResults(true)}
      >
        Preveri
      </button>

      <div aria-live="polite">
        {showResults && (
          <p className="mt-3 font-semibold text-slate-900">
            Pravilnih: {scoreSection(section, answers)} / {section.questions.length}
          </p>
        )}
      </div>
    </section>
  );
}

export function QuizSections({ sections }: { sections: readonly QuizSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </>
  );
}

'use client';

import { useState } from 'react';

import type { QuizSection, TrueFalseQuestion, MultipleChoiceQuestion } from '@/lib/quiz/types';
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
    <div className="my-4">
      <div className="fs-4 fw-bold">{section.naslov}</div>
      <div className="mb-2 fw-light">{section.podnaslov}</div>

      <div className="mb-2">
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
        className="btn btn-primary check-result-button"
        disabled={showResults}
        onClick={() => setShowResults(true)}
      >
        Preveri
      </button>

      <div aria-live="polite">
        {showResults && (
          <div className="mt-2 fw-bold">
            Pravilnih: {scoreSection(section, answers)} / {section.questions.length}
          </div>
        )}
      </div>
    </div>
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

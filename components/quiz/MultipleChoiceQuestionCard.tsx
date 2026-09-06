import type { MultipleChoiceQuestion } from '@/lib/quiz/types';
import { CorrectBadge, WrongBadge } from './ResultBadge';

interface Props {
  question: MultipleChoiceQuestion;
  questionNumber: number;
  /** Stable per section, so radios in different sections form separate groups. */
  groupId: string;
  userAnswer: string | null;
  showResults: boolean;
  onSelect: (value: string) => void;
}

export function MultipleChoiceQuestionCard({
  question,
  questionNumber,
  groupId,
  userAnswer,
  showResults,
  onSelect,
}: Props) {
  const name = `${groupId}-q${questionNumber}`;

  return (
    <div className="p-4">
      <p className="font-medium text-slate-900">
        {questionNumber + 1}. {question.question}
      </p>

      {question.imageSrc && (
        <img
          src={question.imageSrc}
          alt=""
          className="mt-3 max-w-full rounded-lg border border-slate-200 p-1"
        />
      )}

      <div className="mt-3 space-y-1">
        {question.answers.map((answer, index) => {
          // Index-based ids: the old app built ids out of full Slovenian sentences,
          // spaces and periods included, and gave the radios no `name` at all - so they
          // were never a group.
          const id = `${name}-a${index}`;
          return (
            <label
              key={id}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 has-disabled:cursor-default has-disabled:hover:bg-transparent"
            >
              <input
                type="radio"
                name={name}
                id={id}
                checked={userAnswer === answer}
                disabled={showResults}
                onChange={() => onSelect(answer)}
                className="mt-0.5 size-4 shrink-0 border-slate-300 text-slate-900 focus:ring-slate-900/20"
              />
              {answer}
            </label>
          );
        })}
      </div>

      <div aria-live="polite">
        {showResults &&
          (userAnswer === question.correctAnswer ? (
            <CorrectBadge />
          ) : (
            <WrongBadge correctAnswer={question.correctAnswer} />
          ))}
      </div>
    </div>
  );
}

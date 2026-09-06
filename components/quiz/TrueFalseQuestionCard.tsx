import type { TrueFalseQuestion } from '@/lib/quiz/types';
import { cx } from '@/lib/ui';
import { CorrectBadge, WrongBadge } from './ResultBadge';

interface Props {
  question: TrueFalseQuestion;
  questionNumber: number;
  userAnswer: boolean | null;
  showResults: boolean;
  onSelect: (value: boolean) => void;
}

/** The shown answer may be the correct one or a wrong one; the user judges which. */
function isUserCorrect(q: TrueFalseQuestion, userAnswer: boolean | null): boolean {
  return (q.correctAnswer === q.shownAnswer) === userAnswer;
}

export function TrueFalseQuestionCard({
  question,
  questionNumber,
  userAnswer,
  showResults,
  onSelect,
}: Props) {
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

      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
        {question.shownAnswer}
      </p>

      {/* Half-width each on the narrowest screens so both stay comfortably tappable. */}
      <div className="mt-3 flex gap-2">
        {([true, false] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            aria-pressed={userAnswer === value}
            disabled={showResults}
            onClick={() => onSelect(value)}
            className={cx(
              'min-h-10 flex-1 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors sm:flex-none',
              userAnswer === value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
              showResults && 'cursor-default opacity-70',
            )}
          >
            {value ? 'Drži' : 'Ne drži'}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {showResults &&
          (isUserCorrect(question, userAnswer) ? (
            <CorrectBadge />
          ) : (
            <WrongBadge correctAnswer={question.correctAnswer} />
          ))}
      </div>
    </div>
  );
}

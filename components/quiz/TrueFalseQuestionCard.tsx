import type { TrueFalseQuestion } from '@/lib/quiz/types';
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
    <div className="py-2">
      <div className="mb-1 fw-bold">
        {questionNumber + 1}. {question.question}
      </div>

      {question.imageSrc && (
        <img src={question.imageSrc} className="img-thumbnail mb-1" alt="" />
      )}

      <div className="random-answer">{question.shownAnswer}</div>

      <div className="mt-2 true-false-buttons">
        {([true, false] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            className={`btn btn-outline-dark btn-sm ${value ? 'me-2 ' : ''}${
              userAnswer === value ? 'active' : ''
            }`}
            aria-pressed={userAnswer === value}
            disabled={showResults}
            onClick={() => onSelect(value)}
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

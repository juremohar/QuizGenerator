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
    <div className="py-2">
      <div className="mb-1 fw-bold">
        {questionNumber + 1}. {question.question}
      </div>

      {question.imageSrc && (
        <img src={question.imageSrc} className="img-thumbnail mb-1" alt="" />
      )}

      <div className="mt-2">
        {question.answers.map((answer, index) => {
          // Index-based ids: the old app built ids out of full Slovenian sentences,
          // spaces and periods included, and gave the radios no `name` at all - so they
          // were never a group.
          const id = `${name}-a${index}`;
          return (
            <div className="form-check" key={id}>
              <input
                className="form-check-input"
                type="radio"
                name={name}
                id={id}
                checked={userAnswer === answer}
                disabled={showResults}
                onChange={() => onSelect(answer)}
              />
              <label className="form-check-label" htmlFor={id}>
                {answer}
              </label>
            </div>
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

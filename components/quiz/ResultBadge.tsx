export function CorrectBadge() {
  return (
    <div className="badge bg-success mt-2">
      <i className="bi bi-check-circle" /> Pravilen odgovor!
    </div>
  );
}

export function WrongBadge({ correctAnswer }: { correctAnswer: string }) {
  return (
    <div className="callout callout-default mt-2">
      <div className="badge bg-danger mb-1">
        <i className="bi bi-x-circle" /> Napačen odgovor!
      </div>
      <div className="correct-answer">{correctAnswer}</div>
    </div>
  );
}

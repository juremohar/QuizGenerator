import { badge } from '@/lib/ui';

export function CorrectBadge() {
  return (
    <div className={badge('emerald', 'mt-2')}>
      <i className="bi bi-check-circle" aria-hidden="true" /> Pravilen odgovor!
    </div>
  );
}

export function WrongBadge({ correctAnswer }: { correctAnswer: string }) {
  return (
    <div className="mt-2 rounded-lg border border-slate-200 border-l-4 border-l-red-500 bg-white p-3">
      <div className={badge('red')}>
        <i className="bi bi-x-circle" aria-hidden="true" /> Napačen odgovor!
      </div>
      <div className="mt-1.5 text-sm text-slate-700">{correctAnswer}</div>
    </div>
  );
}

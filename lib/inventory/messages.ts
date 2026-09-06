import { formatSl } from '../dates';
import type { RequestProblem } from './availability';

/**
 * Turn a conflict into something a poweruser can act on. Naming the critical day and
 * the clashing loan is the difference between a tool people trust and one they work
 * around - and it is only possible because availability is computed as a peak, so we
 * know WHICH day binds.
 */
export function describeProblem(problem: RequestProblem): string {
  switch (problem.kind) {
    case 'unknownItem':
      return `Oprema (#${problem.itemId}) ne obstaja.`;

    case 'exceedsTotal':
      return `${problem.itemName}: na zalogi je skupaj ${problem.total} kosov, zahtevanih ${problem.requested}.`;

    case 'conflict': {
      const kdaj = problem.peakDate ? ` Kritični dan: ${formatSl(problem.peakDate)}.` : '';
      const kdo =
        problem.conflictingLoanIds.length > 0
          ? ` Zaseda: ${problem.conflictingLoanIds.map((id) => `#${id}`).join(', ')}.`
          : '';
      return `${problem.itemName}: prostih je ${problem.available}, zahtevanih ${problem.requested}.${kdaj}${kdo}`;
    }
  }
}

export function describeProblems(problems: readonly RequestProblem[]): string[] {
  return problems.map(describeProblem);
}

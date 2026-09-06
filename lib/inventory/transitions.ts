export type LoanStatus = 'reserved' | 'out' | 'returned' | 'cancelled';
export type LoanAction = 'predano' | 'vrnjeno' | 'preklicano';

export const STATUS_LABEL: Record<LoanStatus, string> = {
  reserved: 'Rezervirano',
  out: 'Predano',
  returned: 'Vrnjeno',
  cancelled: 'Preklicano',
};

export const STATUS_BADGE: Record<LoanStatus, string> = {
  reserved: 'bg-secondary',
  out: 'bg-primary',
  returned: 'bg-success',
  cancelled: 'bg-dark',
};

/**
 * Allowed lifecycle: reserved -> out -> returned, and reserved -> cancelled.
 *
 * `out -> cancelled` is deliberately NOT allowed: once equipment is physically in
 * someone's hands, the only truthful exit is a return. Enforced here and again by the
 * compare-and-swap `WHERE status = ...` clause on every update.
 */
const TRANSITIONS: Record<LoanStatus, Partial<Record<LoanAction, LoanStatus>>> = {
  reserved: { predano: 'out', preklicano: 'cancelled' },
  out: { vrnjeno: 'returned' },
  returned: {},
  cancelled: {},
};

export function nextStatus(current: LoanStatus, action: LoanAction): LoanStatus | null {
  return TRANSITIONS[current][action] ?? null;
}

export function canTransition(current: LoanStatus, action: LoanAction): boolean {
  return nextStatus(current, action) !== null;
}

/** Statuses that occupy equipment. Returned and cancelled loans free it. */
export const OCCUPYING_STATUSES = ['reserved', 'out'] as const satisfies readonly LoanStatus[];

export type LoanStatus = 'reserved' | 'out' | 'returned' | 'cancelled';
export type LoanAction = 'predano' | 'vrnjeno' | 'preklicano';

export const STATUS_LABEL: Record<LoanStatus, string> = {
  reserved: 'Rezervirano',
  out: 'Predano',
  returned: 'Vrnjeno',
  cancelled: 'Preklicano',
};

/** Badge tone per status. Kept next to the labels so the two never drift apart. */
export const STATUS_TONE = {
  reserved: 'slate',
  out: 'blue',
  returned: 'emerald',
  cancelled: 'dark',
} as const satisfies Record<LoanStatus, string>;

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

import { describe, expect, it } from 'vitest';
import { canTransition, nextStatus, type LoanAction, type LoanStatus } from '@/lib/inventory/transitions';

describe('nextStatus', () => {
  const cases: [LoanStatus, LoanAction, LoanStatus | null][] = [
    ['reserved', 'predano', 'out'],
    ['reserved', 'preklicano', 'cancelled'],
    ['reserved', 'vrnjeno', null],
    ['out', 'vrnjeno', 'returned'],
    // Once equipment is physically handed over, the only truthful exit is a return.
    ['out', 'preklicano', null],
    ['out', 'predano', null],
    ['returned', 'predano', null],
    ['returned', 'vrnjeno', null],
    ['returned', 'preklicano', null],
    ['cancelled', 'predano', null],
    ['cancelled', 'vrnjeno', null],
    ['cancelled', 'preklicano', null],
  ];

  it.each(cases)('%s + %s -> %s', (from, action, expected) => {
    expect(nextStatus(from, action)).toBe(expected);
    expect(canTransition(from, action)).toBe(expected !== null);
  });
});

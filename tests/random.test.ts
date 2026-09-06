import { describe, expect, it } from 'vitest';
import { pickSample, shuffle } from '@/lib/quiz/random';

/** Deterministic generator so permutations are reproducible. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

describe('shuffle', () => {
  it('returns a new array and leaves the input untouched', () => {
    const input = Object.freeze([1, 2, 3, 4, 5]);
    const out = shuffle(input, seeded(1));
    expect(out).not.toBe(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic for a given generator', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(7)));
  });

  // The old `.sort(() => 0.5 - Math.random())` fails this: it is not a uniform shuffle.
  it('is unbiased across all permutations', () => {
    const trials = 120_000;
    const counts = new Map<string, number>();

    for (let i = 0; i < trials; i++) {
      const key = shuffle([0, 1, 2]).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(6);

    const expected = trials / 6;
    for (const n of counts.values()) {
      expect(Math.abs(n - expected) / expected).toBeLessThan(0.05);
    }
  });
});

describe('pickSample', () => {
  it('never returns duplicates and never mutates', () => {
    const input = Object.freeze([1, 2, 3, 4, 5, 6]);
    const out = pickSample(input, 3, seeded(3));
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('clamps to the pool size and handles zero', () => {
    expect(pickSample([1, 2], 5)).toHaveLength(2);
    expect(pickSample([1, 2], 0)).toEqual([]);
    expect(pickSample([], 3)).toEqual([]);
  });
});

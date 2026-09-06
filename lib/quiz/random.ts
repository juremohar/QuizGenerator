export type Rnd = () => number;

/**
 * Fisher-Yates. Returns a NEW array; never mutates the input.
 *
 * Replaces the old `.sort(() => 0.5 - Math.random())`, which is not a shuffle:
 * it feeds a non-transitive comparator to an implementation-defined sort, and on
 * V8's TimSort leaves early elements strongly biased toward their original slots.
 */
export function shuffle<T>(input: readonly T[], rnd: Rnd = Math.random): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Partial Fisher-Yates: unbiased n-of-N sample without shuffling the whole array. */
export function pickSample<T>(input: readonly T[], n: number, rnd: Rnd = Math.random): T[] {
  const a = input.slice();
  const k = Math.max(0, Math.min(n, a.length));
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rnd() * (a.length - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k);
}

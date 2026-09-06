import { describe, expect, it } from 'vitest';

import { DAN, KOS, stevilo } from '@/lib/sl';

describe('stevilo', () => {
  it('picks the singular, dual, few and plural forms', () => {
    expect(stevilo(1, DAN)).toBe('1 dan');
    expect(stevilo(2, DAN)).toBe('2 dneva');
    expect(stevilo(3, DAN)).toBe('3 dni');
    expect(stevilo(4, DAN)).toBe('4 dni');
    expect(stevilo(5, DAN)).toBe('5 dni');
    expect(stevilo(0, DAN)).toBe('0 dni');
  });

  it('selects on the last two digits, not the last one', () => {
    // Unlike Russian, Slovenian keeps the genitive plural through the twenties:
    // "enaindvajset kosov", not "kos". Only 101/102 return to the short forms.
    expect(stevilo(11, KOS)).toBe('11 kosov');
    expect(stevilo(12, KOS)).toBe('12 kosov');
    expect(stevilo(21, KOS)).toBe('21 kosov');
    expect(stevilo(22, KOS)).toBe('22 kosov');
    expect(stevilo(101, KOS)).toBe('101 kos');
    expect(stevilo(102, KOS)).toBe('102 kosa');
    expect(stevilo(103, KOS)).toBe('103 kosi');
  });
});

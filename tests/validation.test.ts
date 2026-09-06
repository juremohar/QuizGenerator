import { describe, expect, it } from 'vitest';
import { itemInputSchema, loanInputSchema, parseItemLines } from '@/lib/inventory/validation';

const valid = {
  borrowerName: '  Janez Novak  ',
  borrowerPhone: '041 234 567',
  purpose: 'Veselica',
  fromDate: '2026-09-01',
  toDate: '2026-09-03',
  items: [{ itemId: 1, quantity: 12 }],
};

describe('loanInputSchema', () => {
  it('accepts and trims a valid loan', () => {
    const parsed = loanInputSchema.parse(valid);
    expect(parsed.borrowerName).toBe('Janez Novak');
    expect(parsed.items).toEqual([{ itemId: 1, quantity: 12 }]);
  });

  it('accepts a single-day loan', () => {
    expect(
      loanInputSchema.safeParse({ ...valid, fromDate: '2026-09-01', toDate: '2026-09-01' }).success,
    ).toBe(true);
  });

  it('rejects an inverted date range', () => {
    const res = loanInputSchema.safeParse({ ...valid, fromDate: '2026-09-05', toDate: '2026-09-01' });
    expect(res.success).toBe(false);
  });

  it('rejects a range longer than a year', () => {
    const res = loanInputSchema.safeParse({ ...valid, fromDate: '2026-01-01', toDate: '2027-06-01' });
    expect(res.success).toBe(false);
  });

  it('rejects a loan with no equipment', () => {
    expect(loanInputSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
  });

  it('rejects the same item listed twice', () => {
    const res = loanInputSchema.safeParse({
      ...valid,
      items: [
        { itemId: 1, quantity: 2 },
        { itemId: 1, quantity: 3 },
      ],
    });
    expect(res.success).toBe(false);
  });

  it('rejects non-positive or fractional quantities', () => {
    expect(loanInputSchema.safeParse({ ...valid, items: [{ itemId: 1, quantity: 0 }] }).success).toBe(false);
    expect(loanInputSchema.safeParse({ ...valid, items: [{ itemId: 1, quantity: -3 }] }).success).toBe(false);
    expect(loanInputSchema.safeParse({ ...valid, items: [{ itemId: 1, quantity: 1.5 }] }).success).toBe(false);
  });

  it('rejects a missing name or phone', () => {
    expect(loanInputSchema.safeParse({ ...valid, borrowerName: ' ' }).success).toBe(false);
    expect(loanInputSchema.safeParse({ ...valid, borrowerPhone: '' }).success).toBe(false);
  });

  it('rejects a phone number with letters', () => {
    expect(loanInputSchema.safeParse({ ...valid, borrowerPhone: 'pokliči me' }).success).toBe(false);
  });

  it('accepts common Slovenian phone formats', () => {
    for (const phone of ['041234567', '041 234 567', '+386 41 234 567', '(01) 234-5678']) {
      expect(loanInputSchema.safeParse({ ...valid, borrowerPhone: phone }).success, phone).toBe(true);
    }
  });

  it('rejects a malformed date', () => {
    expect(loanInputSchema.safeParse({ ...valid, fromDate: '1. 9. 2026' }).success).toBe(false);
    expect(loanInputSchema.safeParse({ ...valid, fromDate: '2026-13-45' }).success).toBe(false);
  });
});

describe('itemInputSchema', () => {
  it('accepts valid equipment', () => {
    const parsed = itemInputSchema.parse({
      name: ' Mize ',
      totalQuantity: '30',
      active: true,
      sortOrder: '40',
      notes: '',
    });
    expect(parsed).toMatchObject({ name: 'Mize', totalQuantity: 30, sortOrder: 40 });
  });

  it('rejects a zero or negative total', () => {
    expect(itemInputSchema.safeParse({ name: 'Mize', totalQuantity: 0, active: true }).success).toBe(false);
    expect(itemInputSchema.safeParse({ name: 'Mize', totalQuantity: -5, active: true }).success).toBe(false);
  });

  it('rejects a name that is too short', () => {
    expect(itemInputSchema.safeParse({ name: 'M', totalQuantity: 1, active: true }).success).toBe(false);
  });
});

describe('parseItemLines', () => {
  function form(pairs: [string, string][]): FormData {
    const fd = new FormData();
    for (const [k, v] of pairs) fd.append(k, v);
    return fd;
  }

  it('pairs repeatable itemId/quantity fields positionally', () => {
    const fd = form([
      ['itemId', '1'],
      ['quantity', '12'],
      ['itemId', '2'],
      ['quantity', '24'],
    ]);
    expect(parseItemLines(fd)).toEqual([
      { itemId: 1, quantity: 12 },
      { itemId: 2, quantity: 24 },
    ]);
  });

  it('skips blank rows left behind by the form', () => {
    const fd = form([
      ['itemId', '1'],
      ['quantity', '12'],
      ['itemId', ''],
      ['quantity', '1'],
    ]);
    expect(parseItemLines(fd)).toEqual([{ itemId: 1, quantity: 12 }]);
  });

  it('skips rows with a non-positive quantity', () => {
    const fd = form([
      ['itemId', '1'],
      ['quantity', '0'],
    ]);
    expect(parseItemLines(fd)).toEqual([]);
  });
});

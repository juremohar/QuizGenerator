import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysInclusive,
  eachDay,
  formatRangeSl,
  formatSl,
  startOfWeek,
  todayLjubljana,
} from '@/lib/dates';

describe('addDays', () => {
  it('crosses the spring DST change (CET -> CEST)', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
  });

  it('crosses the autumn DST change (CEST -> CET)', () => {
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
  });

  it('crosses year end and goes backwards', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  it('handles leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});

describe('todayLjubljana', () => {
  // Vercel runs in UTC; a naive toISOString().slice(0,10) would be a day stale here.
  it('uses the Ljubljana wall clock, not UTC, late at night in summer', () => {
    expect(todayLjubljana(new Date('2026-09-06T22:30:00Z'))).toBe('2026-09-07');
  });

  it('uses the Ljubljana wall clock late at night in winter', () => {
    expect(todayLjubljana(new Date('2026-01-06T23:30:00Z'))).toBe('2026-01-07');
  });

  it('agrees with UTC during the day', () => {
    expect(todayLjubljana(new Date('2026-09-06T09:00:00Z'))).toBe('2026-09-06');
  });
});

describe('day counting', () => {
  it('counts inclusive days', () => {
    expect(daysInclusive('2026-09-01', '2026-09-03')).toBe(3);
    expect(daysInclusive('2026-09-01', '2026-09-01')).toBe(1);
  });

  it('enumerates inclusive days', () => {
    expect(eachDay('2026-09-01', '2026-09-03')).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
    ]);
    expect(eachDay('2026-09-03', '2026-09-01')).toEqual([]);
  });
});

describe('formatting', () => {
  it('formats Slovenian dates and ranges', () => {
    expect(formatSl('2026-09-01')).toBe('1. 9. 2026');
    expect(formatRangeSl('2026-09-01', '2026-09-03')).toBe('1. 9. 2026 – 3. 9. 2026');
    expect(formatRangeSl('2026-09-01', '2026-09-01')).toBe('1. 9. 2026');
  });
});

describe('startOfWeek', () => {
  it('returns the Monday of the containing week', () => {
    expect(startOfWeek('2026-09-06')).toBe('2026-08-31'); // 6 Sep 2026 is a Sunday
    expect(startOfWeek('2026-09-07')).toBe('2026-09-07'); // Monday
    expect(startOfWeek('2026-09-09')).toBe('2026-09-07');
  });
});

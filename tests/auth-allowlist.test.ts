import { afterEach, describe, expect, it, vi } from 'vitest';

async function withAllowlist<T>(value: string | undefined, fn: (isAllowed: (e?: string | null) => boolean) => T) {
  vi.resetModules();
  const previous = process.env.ALLOWED_EMAILS;
  if (value === undefined) delete process.env.ALLOWED_EMAILS;
  else process.env.ALLOWED_EMAILS = value;

  // auth.ts pulls in next-auth, so exercise the pure allowlist logic directly.
  const { isAllowed } = await import('@/lib/allowlist');
  try {
    return fn(isAllowed);
  } finally {
    if (previous === undefined) delete process.env.ALLOWED_EMAILS;
    else process.env.ALLOWED_EMAILS = previous;
  }
}

afterEach(() => vi.resetModules());

describe('isAllowed', () => {
  it('accepts a listed address regardless of case and whitespace', async () => {
    await withAllowlist(' Jure@Example.com , drugi@example.com ', (isAllowed) => {
      expect(isAllowed('jure@example.com')).toBe(true);
      expect(isAllowed('JURE@EXAMPLE.COM')).toBe(true);
      expect(isAllowed('  jure@example.com  ')).toBe(true);
      expect(isAllowed('drugi@example.com')).toBe(true);
    });
  });

  it('rejects an address that is not listed', async () => {
    await withAllowlist('jure@example.com', (isAllowed) => {
      expect(isAllowed('nekdo@example.com')).toBe(false);
    });
  });

  // Fails closed: an empty or missing allowlist must let nobody in, never everybody.
  it('rejects everyone when the allowlist is empty or unset', async () => {
    await withAllowlist(undefined, (isAllowed) => {
      expect(isAllowed('jure@example.com')).toBe(false);
    });
    await withAllowlist('', (isAllowed) => {
      expect(isAllowed('jure@example.com')).toBe(false);
    });
    await withAllowlist('   ,  , ', (isAllowed) => {
      expect(isAllowed('jure@example.com')).toBe(false);
    });
  });

  // Substring matching would let a@b.com in through an allowlist entry of aa@b.com.
  it('never matches on substrings', async () => {
    await withAllowlist('aa@example.com', (isAllowed) => {
      expect(isAllowed('a@example.com')).toBe(false);
    });
  });

  it('rejects a missing email', async () => {
    await withAllowlist('jure@example.com', (isAllowed) => {
      expect(isAllowed(null)).toBe(false);
      expect(isAllowed(undefined)).toBe(false);
      expect(isAllowed('')).toBe(false);
    });
  });
});

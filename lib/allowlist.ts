/**
 * The poweruser allowlist. Pure and dependency-free so it can be unit tested without
 * pulling in next-auth (which needs an RSC/request environment).
 */

/** Read at CALL time so the env var can change without a code change. */
export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Fails CLOSED: an unset or empty ALLOWED_EMAILS lets NOBODY in, never everybody.
 *
 * Uses array `includes` on the split list, never `String.includes`, so `a@b.com` cannot
 * be smuggled in through an allowlist entry of `aa@b.com`.
 */
export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = allowedEmails();
  return list.length > 0 && list.includes(email.trim().toLowerCase());
}

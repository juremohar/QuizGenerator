import { auth } from '@/auth';

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts` (and the export to `proxy`).
 *
 * This layer is UX only - it redirects to the sign-in page before any RSC render and
 * automatically covers future routes under /inventar. It is NOT authorization: see
 * lib/auth-guard.ts. `proxy` always runs on the Node.js runtime in Next 16, which is
 * why `auth()` with the Google provider works directly here and the Next-15-era
 * edge-safe `auth.config.ts` split is no longer needed.
 */
export const proxy = auth((req) => {
  if (!req.auth?.user?.email) {
    const url = new URL('/prijava', req.nextUrl.origin);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return Response.redirect(url);
  }
});

export const config = { matcher: ['/inventar/:path*'] };

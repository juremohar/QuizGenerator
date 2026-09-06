'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The old app used Mithril hash routing (/#!/pionirji/kviz). The URL scheme is now real
 * paths, so existing bookmarks and shared links would silently land on the home page.
 *
 * This has to be client-side: the URL fragment is never sent to the server, so
 * next.config redirects, Vercel rewrites and proxy.ts are all structurally blind to it.
 */
const LEGACY_PATHS = new Set([
  '/',
  '/pionirji/kviz',
  '/mladinci/kviz',
  '/pripravniki/kviz',
  '/literatura',
]);

// Module scope so React StrictMode's double-invoked effect cannot run this twice.
let handled = false;

export function LegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (handled) return;
    handled = true;

    const hash = window.location.hash;
    if (!hash.startsWith('#!')) return;

    const legacyPath = hash.slice(2).split('?')[0] || '/';
    // Unknown legacy paths fall back to home rather than 404ing an old bookmark.
    const target = LEGACY_PATHS.has(legacyPath) ? legacyPath : '/';

    // replace, not push: keeps the back button leaving the site, and drops the hash.
    router.replace(target);
  }, [router]);

  return null;
}

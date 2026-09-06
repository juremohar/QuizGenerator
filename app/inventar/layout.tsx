import type { Metadata } from 'next';

import { requireActor } from '@/lib/auth-guard';
import { NavInventar } from '@/components/inventar/NavInventar';

export const metadata: Metadata = { title: 'Inventar – PGD Veliko Mlačevo' };

/**
 * Render-time gating: guarantees no inventory UI is ever produced for an
 * unauthenticated request, even if proxy.ts is bypassed or its matcher misconfigured.
 * The authorization that actually matters is `requireActor()` inside each Server Action.
 */
export default async function InventarLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireActor();

  return (
    // `.inv` scopes the inventory design tokens and the touch-target sizing, so none of
    // it leaks into the quiz pages that share this stylesheet.
    <div className="inv pb-5">
      <NavInventar actor={actor} />
      {children}
    </div>
  );
}

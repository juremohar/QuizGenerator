import 'server-only';
import { redirect } from 'next/navigation';
import { auth, isAllowed } from '@/auth';

export interface Actor {
  readonly email: string;
  readonly name: string | null;
}

/**
 * The authorization check. Call it as the FIRST statement of every /inventar page and
 * layout, every Server Action, and every route handler that touches inventory data.
 *
 * Server Actions are addressable POST endpoints, independent of which page rendered
 * them, so a logged-out caller who knows an action ID can invoke one directly. Neither
 * proxy.ts (path-based, and middleware has a documented bypass history) nor the layout
 * check runs for an action invocation. Middleware is routing, not authorization.
 *
 * Re-checks `isAllowed`, not merely "is there a session": removing someone from
 * ALLOWED_EMAILS then takes effect on their next request instead of lingering until
 * their JWT expires.
 */
export async function requireActor(): Promise<Actor> {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAllowed(email)) redirect('/prijava');

  return { email: email!.toLowerCase(), name: session?.user?.name ?? null };
}

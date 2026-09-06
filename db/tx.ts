import 'server-only';
import { Pool } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

export type Tx = Parameters<Parameters<NeonDatabase<typeof schema>['transaction']>[0]>[0];

/**
 * Writes, over a WebSocket, in a real interactive transaction.
 *
 * The neon-http driver used for reads CANNOT do this: its `transaction()` is a
 * non-interactive batch, so it cannot read -> decide -> write, which is exactly what
 * the availability check needs.
 *
 * The Pool is created and closed per invocation. A module-scope WebSocket pool leaks
 * connections in serverless, where a socket cannot outlive the request. That is why
 * only the handful of transactional writes pay for a WebSocket while every read goes
 * over stateless HTTP.
 *
 * Node >= 22 provides a global WebSocket, so no `ws` dependency is needed on Vercel's
 * Node 24. On Node <= 21 you would have to set `neonConfig.webSocketConstructor`.
 */
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ni nastavljen.');

  const pool = new Pool({ connectionString: url });
  try {
    return await drizzle({ client: pool, schema }).transaction(fn);
  } finally {
    await pool.end();
  }
}

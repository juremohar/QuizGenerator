import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Db = ReturnType<typeof create>;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ni nastavljen.');
  return drizzle(url, { schema });
}

let cached: Db | null = null;

/**
 * Reads, over stateless HTTP. Lazy and explicit.
 *
 * Lazy because a module-level `drizzle(process.env.DATABASE_URL!)` throws at IMPORT
 * time the moment any tooling loads the module without the env var - a `next build`
 * that touches the module graph, a Vitest run, a tsx script.
 *
 * A plain function, NOT a `new Proxy(...)` wrapper. The Proxy trick (so call sites can
 * keep writing `db.select()`) breaks `instanceof` and private-field access that
 * Drizzle's internals rely on, loses `this` on destructured methods, is a known
 * breakage for Auth.js database adapters, and turns a clear "DATABASE_URL missing"
 * error into a stack trace inside a trap.
 */
export function getDb(): Db {
  if (!cached) cached = create();
  return cached;
}

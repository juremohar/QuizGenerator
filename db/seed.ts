/**
 * Seeds the starting equipment. Run with `npm run db:seed`.
 *
 * Builds its own connection rather than importing db/client.ts: that module carries
 * `import 'server-only'`, which by design cannot be loaded outside an RSC environment.
 */
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { items } from './schema';

// Next.js loads .env.local automatically; a plain Node script does not.
config({ path: '.env.local' });
config();

/** Starting equipment for PGD Veliko Mlačevo. Editable afterwards at /inventar/oprema. */
const OPREMA = [
  { name: 'Hladilnik', totalQuantity: 2, sortOrder: 10 },
  { name: 'Žar', totalQuantity: 1, sortOrder: 20 },
  { name: 'Posoda za vodo', totalQuantity: 4, sortOrder: 30 },
  { name: 'Mize', totalQuantity: 30, sortOrder: 40 },
  { name: 'Klopi', totalQuantity: 60, sortOrder: 50 },
];

/** Host only, never the password - this gets printed. */
function endpointOf(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return '(neberljiv DATABASE_URL)';
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ni nastavljen.');

  // Since dev and production are separate Neon branches, "which one am I about to
  // write to" is a question worth answering out loud before writing.
  console.log(`Polnim bazo: ${endpointOf(url)}`);

  const db = drizzle(neon(url));

  // Idempotent via items_name_key, so re-running is harmless.
  const inserted = await db
    .insert(items)
    .values(OPREMA)
    .onConflictDoNothing({ target: items.name })
    .returning({ id: items.id, name: items.name });

  console.log(
    inserted.length === 0
      ? 'Oprema je že vnesena - nič dodanega.'
      : `Dodana oprema: ${inserted.map((i) => i.name).join(', ')}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

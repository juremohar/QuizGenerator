import 'dotenv/config';
import { getDb } from './client';
import { items } from './schema';

/** Starting equipment for PGD Veliko Mlačevo. Editable afterwards at /inventar/oprema. */
const OPREMA = [
  { name: 'Hladilnik', totalQuantity: 2, sortOrder: 10 },
  { name: 'Žar', totalQuantity: 1, sortOrder: 20 },
  { name: 'Posoda za vodo', totalQuantity: 4, sortOrder: 30 },
  { name: 'Mize', totalQuantity: 30, sortOrder: 40 },
  { name: 'Klopi', totalQuantity: 60, sortOrder: 50 },
];

async function main() {
  // Idempotent via items_name_key, so re-running is harmless.
  await getDb().insert(items).values(OPREMA).onConflictDoNothing({ target: items.name });
  console.log(`Osnovna oprema dodana (${OPREMA.length} vnosov).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

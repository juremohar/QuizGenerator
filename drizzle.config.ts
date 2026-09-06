import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next.js loads .env.local automatically; drizzle-kit does not.
config({ path: '.env.local', quiet: true });
config({ quiet: true });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // DDL and migration bookkeeping want a direct connection, not PgBouncer.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
});

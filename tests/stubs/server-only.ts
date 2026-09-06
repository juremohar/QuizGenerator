/**
 * No-op stand-in for the `server-only` package.
 *
 * The real package throws outside a React Server Component environment, which is
 * exactly what we want in the app - but it also makes the modules that import it
 * untestable. Aliasing it here lets the integration test exercise the REAL
 * lib/inventory/mutations.ts (advisory lock, transaction and all) rather than a copy of
 * its logic, which is the only way the concurrency guarantee is actually verified.
 */
export {};

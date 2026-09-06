# PGD Veliko Mlačevo

Next.js 16 app serving two things at [www.pgd-velikomlacevo.si](https://www.pgd-velikomlacevo.si):

1. **Gasilski kviz** (public) – practice quizzes and literature for pionirji, mladinci and pripravniki.
2. **Inventar** (`/inventar`, private) – equipment lending records, replacing the paper textbook.

## Getting started

```bash
npm install
cp .env.example .env.local     # or: vercel env pull .env.local
npm run dev                    # http://localhost:3000
```

The quiz works with no environment variables. `/inventar` needs `AUTH_SECRET`,
`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS` and `DATABASE_URL`.

```bash
npm run db:migrate    # apply migrations (uses DATABASE_URL_UNPOOLED)
npm run db:seed       # insert the starting equipment; idempotent
npm test              # 104 unit tests
npm run typecheck
```

`drizzle-kit` and `tsx` do not read `.env.local` the way Next.js does, so
`drizzle.config.ts` and `db/seed.ts` load it explicitly - the `db:*` scripts work with no
extra setup.

### Dev and production are separate Neon branches

Neon project `aged-river-74703807` has two branches. A branch is a copy-on-write clone,
not a second database kept in sync by hand: `dev` started as a copy of `main` and stores
only what has changed since.

| Branch | Endpoint          | Used by                                        |
| ------ | ----------------- | ---------------------------------------------- |
| `main` | `ep-cool-leaf-…`  | Vercel **Production** only. The brigade's data. |
| `dev`  | `ep-mute-unit-…`  | Local `.env.local`, Vercel Preview + Development |

Nothing you run locally - `npm run dev`, `db:migrate`, `db:seed`, `npm test` - can reach
production. `db:seed` prints the endpoint it is about to write to before writing.

`tests/db-integration.test.ts` creates and deletes rows, so it reads `TEST_DATABASE_URL`
and never `DATABASE_URL`; leave it unset and the suite skips instead of writing to
whatever `DATABASE_URL` happens to be. It creates its own `[TEST]`-prefixed equipment
rather than depending on seed data, so renaming equipment in the UI cannot break it.

To refresh `dev` with current production data, delete and recreate the branch:

```bash
npx neon branches delete dev --project-id aged-river-74703807
npx neon branches create --project-id aged-river-74703807 --name dev --parent main
```

## Why the inventory works the way it does

The problem it solves is **double-promising**: the brigade has 2 fridges, and more than
once both were promised to different people for the same date. That is a *future*
conflict, so every lend-out is a **date-range reservation** (`from`–`to`, both days
inclusive) rather than a current in/out flag.

**Availability is `total − peak concurrent usage`, not `total − sum of overlapping
loans`.** Summing is too conservative and would refuse valid requests: with 30 tables,
one loan holding 20 on Sep 1–3 and another holding 20 on Sep 5–7, a request for 10 tables
across Sep 1–7 is genuinely satisfiable — every day has at least 10 free — but the sum is
40 > 30. The engine lives in `lib/inventory/availability.ts`; it is pure and unit tested,
including that exact case.

**Writes are serialised.** Checking availability and then inserting is a lost-update: two
powerusers can both pass the check and both insert, recreating the bug in software. The
invariant ("no item is over-committed on any day") is an aggregate over a date range, so
it cannot be a `UNIQUE`, `CHECK`, or `EXCLUDE` constraint. Instead every booking write
runs in one interactive transaction that starts with `pg_advisory_xact_lock`
(`lib/inventory/mutations.ts`). Lifecycle transitions use compare-and-swap instead, so a
double-click performs exactly one transition.

**Two database drivers, on purpose.** Reads use `neon-http` (stateless, nothing to leak).
Writes use `neon-serverless` with a per-request WebSocket `Pool` that is always closed,
because the HTTP driver cannot do interactive transactions and a module-scope WebSocket
pool leaks connections in serverless.

**Dates are `'YYYY-MM-DD'` strings compared lexicographically**, and "today" comes from
the Ljubljana wall clock (`lib/dates.ts`). Vercel functions run in UTC, so
`new Date().toISOString().slice(0,10)` would make the evening "Zamuja" list a day stale.

**Authorization is `requireActor()` inside every Server Action**, not `proxy.ts`. Server
Actions are addressable POST endpoints; middleware is routing. The allowlist fails closed:
an empty `ALLOWED_EMAILS` admits nobody.

## Layout

```
app/                     routes; app/inventar/** is auth-gated
  [kategorija]/kviz/     one dynamic route replacing three duplicate quiz views
components/              quiz/, literatura/, inventar/
lib/quiz/                questions.ts is pure; data.server.ts holds the JSON imports
lib/inventory/           availability.ts + transitions.ts are pure; queries/mutations are server-only
db/                      schema, client (reads), tx (writes), seed
data/*.json              question banks - stays out of public/, it contains the answers
public/images|literatura assets served by the CDN
tests/                   Vitest, node environment, pure modules only
```

`lib/quiz/data.server.ts` and the inventory query/mutation modules use
`import 'server-only'`, which turns an accidental client import into a build error. That
throws outside an RSC environment, which is why the pure logic sits in separate files that
tests can import.

## Known content notes

- The quiz sends `correctAnswer` to the browser. That is inherent to a self-check quiz
  with no backend grading, and was true of the previous version too.
- `data/prva_pomoc.json` has one question ("Kako se imenuje preveza na sliki?") whose two
  wrong answers are the same string, so it renders with 2 options instead of 3. The
  generator de-duplicates; adding a second distinct distractor would restore 3 options.
- `vescine`, `oznake` and `prva_pomoc` have no `pripravnik`-tagged questions, so the
  pripravniki quiz reads its pools as `['pripravnik', 'mladinec']`
  (`lib/quiz/config.ts`). Tagging those questions for `pripravnik` in the data would make
  the union unnecessary.

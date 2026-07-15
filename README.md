# Ledger

A calm, precise personal-finance ledger for India — log every rupee of income and
spending, see where your money goes, and export it whenever you want. Built as an
installable PWA on a serverless, cost-efficient stack designed to stay fast from the
first transaction to the ten-thousandth.

> **Money is stored as `BIGINT` minor units (paise).** No floats, no rounding drift —
> exact arithmetic end to end.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, Server Actions) |
| Language | **TypeScript** (strict) |
| UI | **React 19** + **Tailwind CSS** (design-token driven) |
| Database | **PostgreSQL** via **Supabase** |
| ORM / migrations | **Drizzle ORM** + Drizzle Kit |
| Auth | **Supabase Auth** (email/password + Google OAuth) |
| Connection pooling | **Supavisor** (transaction mode) |
| Rate limiting | **Upstash Redis** (optional in local dev) |
| Billing (scaffold) | **Razorpay** webhooks |
| Deploy target | **Vercel** |

---

## Features

- **Transactions** — credit/debit entries with paise-exact amounts, categories, notes,
  dates, and soft deletes. Written through a single validated Server Action.
- **Auth** — email/password and Google OAuth via Supabase, with session-refresh
  middleware (`proxy`) that guards every app route.
- **Categories** — 12 sensible defaults seeded automatically on signup.
- **CSV export** — one-click, rate-limited export of a user's full ledger.
- **Dashboard / Calendar / Reports** — balance, cashflow, and analytics surfaces.
- **Settings** — currency, notifications, export, sign-out, account deletion.
- **Offline-ready sync endpoint** — idempotent upsert on `(user_id, client_id)` for a
  PWA background-sync queue.
- **Recurring rules** — cron endpoint that materializes due rules with deterministic
  (idempotent) client IDs.

### Backend design highlights

- **O(1) balances via rollup tables.** A trigger maintains `daily_rollups` and
  `user_balances` on every write, so the dashboard never `SUM()`s a user's whole history.
- **Row-Level Security** on every table, using the `(select auth.uid())` pattern so the
  policy predicate is evaluated once per statement, not per row.
- **Keyset pagination** (never `OFFSET`) for the transaction list.
- **Idempotency everywhere it matters** — sync upserts, webhook events, and recurring
  materialization are all safe to replay.
- **Audit log + nightly rollup-drift check** — a wrong balance in a money app is
  existential, so it's detected, not discovered.

---

## Project structure

```
Ledger/
├── README.md
└── ledger-app/             # the Next.js application
    ├── src/
    │   ├── app/            # routes, Server Actions, API route handlers
    │   ├── components/     # UI components
    │   ├── db/             # Drizzle schema, client, scoped repository
    │   └── lib/            # auth, rate limiting, formatting
    ├── setup_triggers_rls.sql   # triggers, RLS policies, seeding, cron (run after push)
    ├── drizzle.config.ts
    └── .env.example
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)
- *(optional)* an [Upstash Redis](https://upstash.com) database for rate limiting

### 1. Install

```bash
cd ledger-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at least the Supabase values:

```
DATABASE_URL=              # Supavisor pooler, port 6543 (transaction mode)
DIRECT_URL=               # direct connection, port 5432 (migrations only)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> Without Supabase env vars the app runs in **demo mode**: the auth guard becomes a
> no-op so the UI is browsable, but sign-in and data writes are disabled.

### 3. Set up the database

```bash
npx drizzle-kit push          # create tables from the Drizzle schema
# then run setup_triggers_rls.sql against your database
# (Supabase SQL editor, or: psql "$DIRECT_URL" -f setup_triggers_rls.sql)
```

`setup_triggers_rls.sql` installs the rollup trigger, RLS policies, default-category
seeding, and the nightly rollup-drift audit.

### 4. Run

```bash
npm run dev        # http://localhost:3000
```

---

## Scripts

Run from `ledger-app/`:

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |

---

## Security

- Secrets live only in `.env.local` (git-ignored); `.env.example` documents shape only.
- The Supabase **service-role key** is server-only — never `NEXT_PUBLIC_*`.
- Input is validated with **Zod** at every boundary (Server Actions, route handlers, webhooks).
- Webhooks verify an **HMAC signature** with a timing-safe comparison over the raw body.
- Cron endpoints are gated on a `CRON_SECRET` bearer token.
- Security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, …) are set in
  `next.config.mjs`.

---

## Project status

The **backend and the write/auth/export flows are wired end-to-end** (auth, add
transaction, categories, CSV export, sync, webhooks, cron).

The **read/display pages** (`/`, `/calendar`, `/reports`) currently render illustrative
mock data; the queries to make them live already exist in `src/db/repo.ts`
(`balance()`, `listTransactions()`, `monthRollup()`) and are the next integration step.

---

## License

Released under the MIT License.

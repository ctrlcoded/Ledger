# Ledger: High-Performance Personal Finance Engine

A calm, precise, and meticulously architected personal finance ledger for India. Built as an installable Progressive Web App (PWA), Ledger provides a fast, resilient, and offline-capable experience for tracking every rupee of income and expenditure.

Engineered for scale and exactness, Ledger is built on a serverless, cost-efficient stack designed to remain incredibly performant from the first transaction to the ten-thousandth. 

---

## 🏛 Architecture & Engineering Philosophy

Ledger is designed with a set of strict architectural invariants to ensure data integrity, optimal performance, and developer ergonomics.

### 1. Exact Arithmetic (`BIGINT`)
**Money is stored strictly as `BIGINT` minor units (paise).**
There are no floating-point approximations or rounding drifts. Currency values are treated as exact integers end-to-end, parsed into `number` or `BigInt` at the network boundary, and safely formatted only at the presentation layer.

### 2. O(1) Aggregations via PostgreSQL Triggers
Financial applications often degrade in performance as transaction history grows due to naive `SUM()` queries over entire ledgers.
Ledger solves this using **asynchronous materialized rollups**. A series of optimized PostgreSQL triggers maintain `daily_rollups` and `user_balances` tables on every write. The frontend dashboard achieves O(1) read complexity, querying pre-aggregated states instead of raw transaction logs.

### 3. Idempotency & Synchronization
Distributed systems and offline-first PWAs require robust replayability.
- **Sync Upserts**: Background-sync queues in the PWA use an idempotent upsert model keyed on a composite `(user_id, client_id)`. Network retries never duplicate transactions.
- **Webhook Handlers**: External webhook events (e.g., Razorpay) are deduped using deterministic hashing.
- **Cron Materialization**: Recurring transaction rules are evaluated idempotently, meaning the cron endpoint can be safely re-triggered without generating duplicate entries.

### 4. Edge-Proxied Authentication
Authentication leverages Supabase Auth (Email/Password + Google OAuth), but the session is strictly guarded by Next.js Edge Middleware (`proxy.ts`). Every application route is protected before hitting the Node.js runtime, ensuring unauthenticated requests never consume serverless compute resources.

---

## 🛠 Technology Stack

| Domain | Technology & Justification |
|---|---|
| **Framework** | **Next.js 16** (App Router, Turbopack, Server Actions) for React Server Components (RSC) and seamless API boundaries. |
| **Language** | **TypeScript** (Strict Mode) for end-to-end type safety. |
| **UI & Styling** | **React 19** + **Tailwind CSS**. Custom design tokens, dark/light mode (`ThemeToggle.tsx`), and highly modular components. |
| **Database** | **PostgreSQL** (via Supabase) utilizing advanced features like Triggers, Functions, and Row-Level Security (RLS). |
| **ORM** | **Drizzle ORM**. Lightweight, type-safe, and avoids the heavy abstraction penalties of traditional ORMs. |
| **Connection Pooling**| **Supavisor** running in transaction mode to handle serverless connection limits. |
| **Rate Limiting** | **Upstash Redis** for sliding-window rate limiting on critical mutations (e.g., CSV exports, login attempts). |
| **Deployment** | **Vercel** (Edge + Serverless Functions). |

---

## 🛡 Security Posture

- **Row-Level Security (RLS)**: Every table enforces RLS. Policies use the `(select auth.uid())` pattern, ensuring the predicate is evaluated once per statement rather than per row, optimizing Postgres query planning.
- **Boundary Validation**: All inputs traversing the client-server boundary (via Server Actions or Route Handlers) are strictly validated using **Zod**.
- **Timing-Safe Webhooks**: External webhooks verify HMAC signatures using constant-time string comparisons to prevent timing attacks.
- **Cron Authorization**: System endpoints are securely gated behind a highly entropic `CRON_SECRET` bearer token.
- **Strict Headers**: `next.config.mjs` enforces standard security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 📂 Project Structure

```text
Ledger/
├── ledger-app/                  # Core Next.js Application
│   ├── src/
│   │   ├── app/                 # RSC Routes, Server Actions, API Handlers
│   │   ├── components/ui/       # Granular UI Components (Navbar, ThemeToggle, ProfileMenu)
│   │   ├── components/dashboard/# Complex Feature Modules
│   │   ├── db/                  # Drizzle Schema, Repo patterns, Migrations
│   │   └── lib/                 # Auth primitives, Rate limiting, Utility functions
│   ├── setup_triggers_rls.sql   # Postgres DDL for Triggers, RLS, and Seeding
│   ├── run-drizzle.js           # Drizzle execution scripts
│   ├── run-sql.js               # SQL runner utility
│   ├── drizzle.config.ts        # Drizzle ORM configuration
│   └── tailwind.config.ts       # Tailwind design tokens and custom plugins
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js 20+**
- A [Supabase](https://supabase.com) project
- *(Optional)* [Upstash Redis](https://upstash.com) for local rate limiting testing.

### 1. Clone & Install
```bash
git clone https://github.com/ctrlcoded/Ledger.git
cd Ledger/ledger-app
npm install
```

### 2. Environment Configuration
Copy the environment template:
```bash
cp .env.example .env.local
```
Populate the required Supabase variables:
```env
DATABASE_URL=              # Supavisor pooler, port 6543 (transaction mode)
DIRECT_URL=                # Direct connection, port 5432 (migrations only)
NEXT_PUBLIC_SUPABASE_URL=  # Your Supabase API URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Your Supabase Anon Key
```
> **Note**: If Supabase variables are omitted, the app will gracefully degrade into **demo mode**. The auth guard becomes a no-op, allowing UI inspection, but data mutations will be disabled.

### 3. Database Initialization
Push the schema using Drizzle, then apply the advanced Postgres triggers and RLS policies:
```bash
npx drizzle-kit push
node run-sql.js setup_triggers_rls.sql
```
*(Alternatively, execute `setup_triggers_rls.sql` manually in the Supabase SQL Editor.)*

### 4. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 📄 License
Released under the MIT License.

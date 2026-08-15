<div align="center">

# Lekha

*Every rupee, accounted for. A lightning-fast, premium personal finance tracker built for the modern web.*<br><br>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

<br>

Lekha is a high-performance, mobile-responsive web application designed to help users track their income and expenses effortlessly. Built with a focus on speed, aesthetics, and reliability, it leverages edge computing and modern React paradigms to deliver an app-like experience in the browser.

</div>

---

## 🚀 Key Features

- **Dashboard Overview:** Instant insights into your current balance, monthly income, expenses, and net cash flow.
- **Transaction Ledger:** Log transactions with categories, amounts, dates, and notes. Offline-ready optimistic UI updates.
- **Calendar View:** A detailed, interactive calendar to review daily spending habits and add transactions to any specific date.
- **Authentication:** Secure email/password and Google OAuth sign-in, powered by Supabase Auth.
- **Dynamic 3D Avatars:** Automatic assignment of premium 3D avatars based on gender selection during onboarding.
- **Responsive Design:** A beautifully crafted, glassmorphism-inspired UI that looks perfect on both desktop and mobile devices.
- **Theme Support:** Native Light, Dark, and System theme synchronization.

---

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, React Server Components)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Hosted on Supabase)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe schema definition and querying)
- **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom design system, CSS variables)
- **Deployment:** [Vercel](https://vercel.com) (Edge Functions, Serverless)

---

## 🏗 System Architecture

Lekha follows a modern serverless architecture, heavily utilizing Next.js Server Components to reduce client-side JavaScript, and Server Actions for secure, API-less mutations.

### High-Level Flow

```mermaid
graph TD
    Client["Client (Browser/Mobile)"]
    NextJS["Next.js App Router"]
    ServerActions["Server Actions"]
    SupabaseAuth["Supabase Auth"]
    DB[("PostgreSQL via Supavisor")]

    Client -->|App Navigation and Forms| NextJS
    Client -->|Auth State| SupabaseAuth
    NextJS -->|Reads and Writes| DB
    NextJS -->|Mutations| ServerActions
    ServerActions -->|Secure Writes| DB
```

### Database Schema (Entity Relationship)

The database is heavily normalized and utilizes triggers to maintain referential integrity and calculate daily rollups synchronously for ultra-fast dashboard queries.

```mermaid
erDiagram
    PROFILES ||--o{ TRANSACTIONS : creates
    PROFILES ||--o{ CATEGORIES : owns
    PROFILES ||--o{ ACCOUNTS : owns
    PROFILES ||--o{ RECURRING_RULES : owns
    PROFILES ||--o{ DAILY_ROLLUPS : aggregates
    
    PROFILES {
        uuid id PK
        text display_name
        text avatar_url
        text gender
        timestamp created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        enum direction "credit | debit"
        bigint amount_minor
        date occurred_on
    }

    CATEGORIES {
        uuid id PK
        uuid user_id FK
        text name
        text icon
        enum direction
    }

    DAILY_ROLLUPS {
        uuid user_id PK
        date day PK
        bigint credit_minor
        bigint debit_minor
        bigint net_minor
        integer txn_count
    }
```

### Key Architectural Decisions

1. **Transaction Pooler:** We use Supabase's Supavisor connection pooler on port `6543` in Transaction Mode (`prepare: false`, `max: 1`) to ensure serverless edge functions don't exhaust database connections.
2. **Database Triggers for Rollups:** To avoid expensive `SUM()` aggregations on the dashboard, we use PostgreSQL triggers (`fn_update_daily_rollups`) to eagerly materialize `daily_rollups` and `user_balances` tables on every transaction insert/update/delete.
3. **Optimistic Updates:** Client-side mutations utilize React's `useTransition` and Next.js `revalidatePath` to provide instant UI feedback while the server processes the data in the background.

---

## 💻 Local Development Setup

Follow these steps to run Lekha locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- A [Supabase](https://supabase.com) account

### 1. Clone the repository
```bash
git clone https://github.com/ctrlcoded/Ledger.git
cd Ledger/ledger-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the `ledger-app` directory and populate it with your Supabase credentials:

```env
# Pooler connection (Port 6543) - Used by the app at runtime
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Direct connection (Port 5432) - Used strictly for Drizzle migrations
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
```

### 4. Database Setup & Migrations
Push the Drizzle schema to your Supabase instance:
```bash
npx drizzle-kit push
```

Next, run the `setup_triggers_rls.sql` script directly in your Supabase SQL Editor. This script:
1. Enables Row Level Security (RLS) policies.
2. Creates the profile auto-generation triggers on signup.
3. Sets up the ledger balance rollup triggers.

### 5. Start the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

Lekha is optimized for deployment on Vercel. 

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add all the environment variables from your `.env.local` to the Vercel project settings.
4. Click **Deploy**.

*Note: Ensure your `DATABASE_URL` in production utilizes a transaction pooler (like Supavisor) to prevent connection timeouts during traffic spikes.*

---

## 📈 Scalability Roadmap

For future high-scale deployment (100k+ concurrent users), the following architectural upgrades have been audited and planned:

1. **PostgreSQL Partitioning:** Implement `pg_partman` to partition the `audit_log` and `transactions` tables by month to prevent index bloat.
2. **Read-Replicas:** Offload heavy `getOverview` and `getCalendarMonth` queries to Supabase read-replicas.
3. **Redis Caching:** Introduce Upstash Redis to cache static category and user profile data.

---

## 📝 License

This project is licensed under the MIT License.

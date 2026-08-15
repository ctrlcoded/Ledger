import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Reuse a single pool across module re-evaluations / HMR. On Vercel serverless
// each function process gets its own (max: 1) pool; on a long-lived server
// (Docker/Railway) this globalThis guard prevents a new pool per import.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

// Supavisor transaction mode requires prepare: false and max: 1.
const client =
  globalForDb.pgClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (!globalForDb.pgClient) globalForDb.pgClient = client;

export const db = drizzle(client, { schema });

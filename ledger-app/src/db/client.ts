import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Supavisor transaction mode requires prepare: false and max: 1 for serverless functions
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

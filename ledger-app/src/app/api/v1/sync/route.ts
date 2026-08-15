import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { db } from '@/db/client';
import { transactions, txnDirectionEnum } from '@/db/schema';
import { sql, and, eq, asc } from 'drizzle-orm';

const TransactionUpsert = z.object({
  clientId:     z.string().uuid(),
  direction:    z.enum(['credit', 'debit']),
  amountMinor:  z.coerce.bigint().positive().max(10_000_000_000n),
  currencyCode: z.string().length(3).default('INR'),
  occurredOn:   z.string().date(),
  categoryId:   z.string().uuid().nullable(),
  note:         z.string().max(500).nullable(),
  deletedAt:    z.string().datetime().nullable().optional(),
  updatedAt:    z.string().datetime().nullable().optional(),
});

const SyncPush = z.object({
  transactions: z.array(TransactionUpsert).max(500),
  since: z.string().datetime().optional(),
  // keyset cursor for paging the delta pull (preferred over `since`)
  cursor: z.object({ updatedAt: z.string().datetime(), id: z.string().uuid() }).optional(),
});

const PULL_LIMIT = 1000;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'UNAUTHENTICATED' }, { status: 401 });

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { success } = await rateLimit.sync.limit(session.userId);
    if (!success) return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  const body = SyncPush.parse(await req.json());

  // push — one statement, idempotent
  if (body.transactions.length > 0) {
    await db
      .insert(transactions)
      .values(body.transactions.map((t) => ({ 
        ...t, 
        userId: session.userId,
        deletedAt: t.deletedAt ? new Date(t.deletedAt) : null,
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
      })))
      .onConflictDoUpdate({
        target: [transactions.userId, transactions.clientId],
        set: {
          amountMinor: sql`excluded.amount_minor`,
          direction:   sql`excluded.direction`,
          occurredOn:  sql`excluded.occurred_on`,
          categoryId:  sql`excluded.category_id`,
          note:        sql`excluded.note`,
          deletedAt:   sql`excluded.deleted_at`,
          updatedAt:   sql`now()`,
        },
        // last-write-wins guard
        where: sql`transactions.updated_at < excluded.updated_at`,
      });
  }

  // pull — delta via a stable keyset over (updated_at, id). Uses idx_txn_sync
  // and paginates deterministically (CRITICAL-7): first sync no longer relies
  // on an unstable full-scan ordering.
  const changed = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.userId),
        body.cursor
          ? sql`(${transactions.updatedAt}, ${transactions.id}) > (${new Date(body.cursor.updatedAt)}, ${body.cursor.id})`
          : body.since
            ? sql`${transactions.updatedAt} > ${new Date(body.since)}`
            : sql`true`
      )
    )
    .orderBy(asc(transactions.updatedAt), asc(transactions.id))
    .limit(PULL_LIMIT);

  const nextCursor =
    changed.length === PULL_LIMIT
      ? { updatedAt: changed[changed.length - 1].updatedAt, id: changed[changed.length - 1].id }
      : null;

  return Response.json({ changed, nextCursor, serverTime: new Date().toISOString() });
}

import { v5 as uuidv5 } from 'uuid';
import { db } from '@/db/client';
import { recurringRules, transactions } from '@/db/schema';
import { and, or, eq, gt, lt, isNull, inArray } from 'drizzle-orm';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const BATCH = 500;

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  let lastId: string | null = null;
  let processed = 0;

  // Process only DUE rules (index idx_recurring_due), paginated by id so a
  // single invocation never loads the whole table into memory. Each batch is
  // two statements (bulk insert + bulk update), not 2×N sequential writes.
  for (;;) {
    const due = await db
      .select()
      .from(recurringRules)
      .where(
        and(
          eq(recurringRules.isPaused, false),
          or(isNull(recurringRules.lastRunOn), lt(recurringRules.lastRunOn, today)),
          lastId ? gt(recurringRules.id, lastId) : undefined
        )
      )
      .orderBy(recurringRules.id)
      .limit(BATCH);

    if (due.length === 0) break;

    const values = due.map((rule) => ({
      userId: rule.userId,
      clientId: uuidv5(`${rule.id}:${today}`, NAMESPACE),
      accountId: rule.accountId,
      categoryId: rule.categoryId,
      direction: rule.direction,
      amountMinor: rule.amountMinor,
      currencyCode: rule.currencyCode,
      occurredOn: today,
      note: rule.note,
      recurringId: rule.id,
    }));

    // Idempotent: a second run for the same day is a no-op (uq_txn_client).
    await db.insert(transactions).values(values).onConflictDoNothing();
    await db
      .update(recurringRules)
      .set({ lastRunOn: today })
      .where(inArray(recurringRules.id, due.map((r) => r.id)));

    processed += due.length;
    lastId = due[due.length - 1].id;
    if (due.length < BATCH) break;
  }

  return Response.json({ ok: true, processed });
}

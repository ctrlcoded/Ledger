import { v5 as uuidv5 } from 'uuid';
import { db } from '@/db/client';
import { recurringRules, transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 });
  }

  // Find rules that are due (this is a simplified logic to demonstrate the pattern)
  const dueRules = await db
    .select()
    .from(recurringRules)
    .where(eq(recurringRules.isPaused, false)); // Add date logic in production

  for (const rule of dueRules) {
    const occurrenceDate = new Date().toISOString().split('T')[0];
    const clientId = uuidv5(`${rule.id}:${occurrenceDate}`, NAMESPACE);

    await db
      .insert(transactions)
      .values({
        userId: rule.userId,
        clientId,
        accountId: rule.accountId,
        categoryId: rule.categoryId,
        direction: rule.direction,
        amountMinor: rule.amountMinor,
        currencyCode: rule.currencyCode,
        occurredOn: occurrenceDate,
        note: rule.note,
        recurringId: rule.id,
      })
      .onConflictDoNothing(); // If it already ran, it's a no-op

    // Update lastRunOn
    await db
      .update(recurringRules)
      .set({ lastRunOn: occurrenceDate })
      .where(eq(recurringRules.id, rule.id));
  }

  return new Response('ok', { status: 200 });
}

import { and, eq, isNull, desc, sql, gt } from 'drizzle-orm';
import { db } from './client';
import { transactions, dailyRollups, userBalances, categories } from './schema';

/**
 * Every query goes through here. There is no exported function that
 * touches `transactions` without a userId in scope.
 */
export function forUser(userId: string) {
  const mine = eq(transactions.userId, userId);
  const live = isNull(transactions.deletedAt);

  return {
    /** Keyset pagination. Never OFFSET — it degrades linearly. */
    async listTransactions(cursor?: { day: string; id: string }, limit = 50) {
      return db
        .select()
        .from(transactions)
        .where(
          cursor
            ? and(mine, live, sql`(${transactions.occurredOn}, ${transactions.id}) < (${cursor.day}, ${cursor.id})`)
            : and(mine, live)
        )
        .orderBy(desc(transactions.occurredOn), desc(transactions.id))
        .limit(limit);
    },

    /** O(1) — single row read, no aggregation. */
    async balance(currency = 'INR') {
      const [row] = await db
        .select({ balanceMinor: userBalances.balanceMinor })
        .from(userBalances)
        .where(and(eq(userBalances.userId, userId), eq(userBalances.currencyCode, currency)));
      return row?.balanceMinor ?? BigInt(0);
    },

    /** Targeted date-range read — index seek on idx_txn_list, no JS filtering. */
    async listByDateRange(from: string, to: string, limit = 1000) {
      return db
        .select()
        .from(transactions)
        .where(and(mine, live, sql`${transactions.occurredOn} between ${from} and ${to}`))
        .orderBy(desc(transactions.occurredOn), desc(transactions.id))
        .limit(limit);
    },

    /** Category spend aggregation pushed down to Postgres (GROUP BY, not JS). */
    async categoryBreakdown(from: string, to: string, currency = 'INR') {
      return db
        .select({
          categoryId: transactions.categoryId,
          totalMinor: sql<string>`sum(${transactions.amountMinor})`,
          count: sql<number>`count(*)::int`,
        })
        .from(transactions)
        .where(
          and(
            mine,
            live,
            eq(transactions.direction, 'debit'),
            eq(transactions.currencyCode, currency),
            sql`${transactions.occurredOn} between ${from} and ${to}`
          )
        )
        .groupBy(transactions.categoryId);
    },

    /** ≤31 rows. Powers the calendar and the dashboard band. */
    async monthRollup(from: string, to: string, currency = 'INR') {
      return db
        .select()
        .from(dailyRollups)
        .where(
          and(
            eq(dailyRollups.userId, userId),
            eq(dailyRollups.currencyCode, currency),
            sql`${dailyRollups.day} between ${from} and ${to}`
          )
        );
    },
    
    async getCategories() {
      return db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId));
    }
  };
}

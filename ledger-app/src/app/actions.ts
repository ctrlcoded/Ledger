'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { db } from '@/db/client';
import { transactions, auditLog, categories } from '@/db/schema';

const AddTransaction = z.object({
  clientId:     z.string().uuid(),
  direction:    z.enum(['credit', 'debit']),
  // amount is sent in minor units (paise) as a number; coerced to bigint
  amountMinor:  z.coerce.bigint().positive().max(10_000_000_000n),
  currencyCode: z.string().length(3).default('INR'),
  occurredOn:   z.string().date(),
  accountId:    z.string().uuid().nullable().default(null),
  categoryId:   z.string().uuid().nullable().default(null),
  note:         z.string().max(500).nullable().default(null),
});

export async function addTransaction(input: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { success } = await rateLimit.write.limit(session.userId);
    if (!success) return { ok: false, error: 'RATE_LIMITED' } as const;
  }

  const parsed = AddTransaction.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'INVALID', issues: parsed.error.issues } as const;
  }

  const values = { ...parsed.data, userId: session.userId };

  const [row] = await db
    .insert(transactions)
    .values(values)
    .onConflictDoUpdate({
      target: [transactions.userId, transactions.clientId],
      // never overwrite the identity columns on conflict
      set: {
        direction:    values.direction,
        amountMinor:  values.amountMinor,
        currencyCode: values.currencyCode,
        occurredOn:   values.occurredOn,
        accountId:    values.accountId,
        categoryId:   values.categoryId,
        note:         values.note,
        updatedAt:    new Date(),
      },
    })
    .returning({ id: transactions.id });

  // audit every money mutation (Backend_archi §3.10)
  const h = await headers();
  await db.insert(auditLog).values({
    userId:    session.userId,
    action:    'create',
    entity:    'transaction',
    entityId:  row.id,
    after:     { ...values, amountMinor: values.amountMinor.toString() },
    userAgent: h.get('user-agent') ?? null,
  });

  revalidateTag(`user:${session.userId}:txn`, 'max');
  revalidateTag(`user:${session.userId}:rollup`, 'max');

  return { ok: true, id: row.id } as const;
}

export async function getCategories() {
  const session = await getSession();
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      direction: categories.direction,
    })
    .from(categories)
    .where(eq(categories.userId, session.userId))
    .orderBy(categories.sortOrder);

  return { ok: true, categories: rows } as const;
}

export async function softDeleteTransaction(id: string) {
  const session = await getSession();
  if (!session) return { ok: false, error: 'UNAUTHENTICATED' } as const;

  await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.userId)));

  await db.insert(auditLog).values({
    userId: session.userId,
    action: 'delete',
    entity: 'transaction',
    entityId: id,
  });

  revalidateTag(`user:${session.userId}:txn`, 'max');
  revalidateTag(`user:${session.userId}:rollup`, 'max');

  return { ok: true } as const;
}

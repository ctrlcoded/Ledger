import { and, desc, eq, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { db } from '@/db/client';
import { transactions, categories } from '@/db/schema';

// RFC 4180 field escaping.
function csvField(value: string | null): string {
  const s = value ?? '';
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'UNAUTHENTICATED' }, { status: 401 });

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { success } = await rateLimit.export.limit(session.userId);
    if (!success) return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  const rows = await db
    .select({
      occurredOn: transactions.occurredOn,
      direction: transactions.direction,
      amountMinor: transactions.amountMinor,
      currencyCode: transactions.currencyCode,
      category: categories.name,
      note: transactions.note,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.userId, session.userId), isNull(transactions.deletedAt)))
    .orderBy(desc(transactions.occurredOn), desc(transactions.id));

  const header = ['Date', 'Direction', 'Amount', 'Currency', 'Category', 'Note'];
  const lines = [header.join(',')];

  for (const r of rows) {
    const rupees = (Number(r.amountMinor) / 100).toFixed(2);
    const signed = r.direction === 'debit' ? `-${rupees}` : rupees;
    lines.push(
      [
        csvField(r.occurredOn),
        csvField(r.direction),
        csvField(signed),
        csvField(r.currencyCode),
        csvField(r.category),
        csvField(r.note),
      ].join(',')
    );
  }

  const csv = lines.join('\r\n');
  const filename = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

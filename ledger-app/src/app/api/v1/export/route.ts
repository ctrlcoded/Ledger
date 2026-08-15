import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { db } from '@/db/client';
import { transactions, categories } from '@/db/schema';

// RFC 4180 field escaping.
function csvField(value: string | null): string {
  const s = value ?? '';
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const PAGE = 1000;

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'UNAUTHENTICATED' }, { status: 401 });

  const { success } = await rateLimit.export.limit(session.userId);
  if (!success) return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });

  const encoder = new TextEncoder();
  const header = ['Date', 'Direction', 'Amount', 'Currency', 'Category', 'Note'].join(',');

  // Keyset cursor over (occurred_on, id) — streams the whole history in
  // bounded-memory pages instead of buffering every row + one giant string.
  let cursor: { occurredOn: string; id: string } | null = null;
  let done = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(header + '\r\n'));
    },
    async pull(controller) {
      if (done) return controller.close();

      const rows = await db
        .select({
          id: transactions.id,
          occurredOn: transactions.occurredOn,
          direction: transactions.direction,
          amountMinor: transactions.amountMinor,
          currencyCode: transactions.currencyCode,
          category: categories.name,
          note: transactions.note,
        })
        .from(transactions)
        .leftJoin(categories, eq(categories.id, transactions.categoryId))
        .where(
          and(
            eq(transactions.userId, session.userId),
            isNull(transactions.deletedAt),
            cursor
              ? sql`(${transactions.occurredOn}, ${transactions.id}) < (${cursor.occurredOn}, ${cursor.id})`
              : sql`true`
          )
        )
        .orderBy(desc(transactions.occurredOn), desc(transactions.id))
        .limit(PAGE);

      if (rows.length === 0) {
        done = true;
        return controller.close();
      }

      let chunk = '';
      for (const r of rows) {
        const rupees = (Number(r.amountMinor) / 100).toFixed(2);
        const signed = r.direction === 'debit' ? `-${rupees}` : rupees;
        chunk +=
          [
            csvField(r.occurredOn),
            csvField(r.direction),
            csvField(signed),
            csvField(r.currencyCode),
            csvField(r.category),
            csvField(r.note),
          ].join(',') + '\r\n';
      }
      controller.enqueue(encoder.encode(chunk));

      const last = rows[rows.length - 1];
      cursor = { occurredOn: last.occurredOn, id: last.id };
      if (rows.length < PAGE) done = true;
    },
  });

  const filename = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

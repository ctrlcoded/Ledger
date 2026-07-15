import crypto from 'node:crypto';
import { db } from '@/db/client';
import { webhookEvents } from '@/db/schema';

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') ?? '';

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'secret')
    .update(raw)
    .digest('hex');

  // timing-safe — never use ===
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return new Response('invalid signature', { status: 401 });
  }

  const event = JSON.parse(raw);

  // idempotency gate — providers redeliver
  const inserted = await db
    .insert(webhookEvents)
    .values({ id: event.id, provider: 'razorpay', type: event.event, payload: event })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id });

  if (inserted.length === 0) return new Response('ok', { status: 200 }); // already handled

  // await handleBillingEvent(event); // Implement handleBillingEvent in db/repo.ts when billing logic is required
  
  return new Response('ok', { status: 200 });
}

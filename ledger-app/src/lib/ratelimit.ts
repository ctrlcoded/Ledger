import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only wire up Redis when Upstash is actually configured. When it isn't
// (e.g. local dev), every limiter becomes a no-op that allows the request,
// so features like add-transaction / export / sync keep working instead of
// throwing on an empty client.
const configured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

type Limiter = Pick<Ratelimit, 'limit'>;

const allowAll: Limiter = {
  limit: async () =>
    ({ success: true, limit: 0, remaining: 0, reset: 0, pending: Promise.resolve() } as Awaited<
      ReturnType<Ratelimit['limit']>
    >),
};

const redis = configured ? Redis.fromEnv() : null;

function make(limiter: ConstructorParameters<typeof Ratelimit>[0]['limiter'], prefix: string): Limiter {
  return redis ? new Ratelimit({ redis, limiter, prefix }) : allowAll;
}

export const rateLimit = {
  // brute-force protection — the tightest limit in the app
  auth:   make(Ratelimit.slidingWindow(5, '15 m'), 'rl:auth'),
  write:  make(Ratelimit.slidingWindow(60, '1 m'), 'rl:write'),
  read:   make(Ratelimit.slidingWindow(200, '1 m'), 'rl:read'),
  sync:   make(Ratelimit.slidingWindow(20, '1 m'), 'rl:sync'),
  // export is expensive — throttle hard
  export: make(Ratelimit.fixedWindow(3, '1 h'), 'rl:export'),
};

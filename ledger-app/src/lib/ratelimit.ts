import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create redis instance if env vars are present (to avoid crashing in local dev without Upstash)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : ({} as any);

export const rateLimit = {
  // brute-force protection — the tightest limit in the app
  auth:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'),  prefix: 'rl:auth' }),
  write: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m'),  prefix: 'rl:write' }),
  read:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(200, '1 m'), prefix: 'rl:read' }),
  sync:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '1 m'),  prefix: 'rl:sync' }),
  // export is expensive — throttle hard
  export: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(3, '1 h'),    prefix: 'rl:export' }),
};

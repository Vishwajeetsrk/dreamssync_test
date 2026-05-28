import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * DreamSync Global Rate Limiting Engine
 * Powered by Upstash Redis (Edge-compatible)
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('[RATELIMIT] Upstash Redis credentials missing. Falling back to permissive mode.');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'temp',
});

export const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function wrapSafe(limiter: Ratelimit) {
  const originalLimit = limiter.limit.bind(limiter);
  limiter.limit = async function(identifier: string, options?: any): Promise<any> {
    if (!hasRedis) {
      return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
    }
    try {
      return await originalLimit(identifier, options);
    } catch (error) {
      console.error('[RATELIMIT] Redis connection failed, falling back to permissive limit.', error);
      return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
    }
  };
  return limiter;
}

// 1. Global Standard Rate Limit (50 requests per 10 seconds per IP)
export const globalRateLimit = wrapSafe(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '10 s'),
  analytics: true,
  prefix: 'ds:ratelimit:global',
}));

// 2. High-Depth Tool Rate Limit (e.g. AI Roadmap/ATS) - 10 requests per minute
export const toolRateLimit = wrapSafe(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ds:ratelimit:tool',
}));

// 3. Login/Auth Attempt Rate Limit (1,000 attempts per 15 minutes - Relaxed for testing)
export const authRateLimit = wrapSafe(new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '15 m'),
  analytics: true,
  prefix: 'ds:ratelimit:auth',
}));

export { redis };

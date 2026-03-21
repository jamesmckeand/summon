import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type LimiterKey = string;

// Cache Ratelimit instances per config key
const limiters = new Map<LimiterKey, Ratelimit>();

function getLimiter(limit: number, windowSeconds: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `${limit}:${windowSeconds}`;
  if (!limiters.has(key)) {
    const redis = new Redis({ url, token });
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: "summon:rl",
        ephemeralCache: new Map(),
      })
    );
  }
  return limiters.get(key)!;
}

// In-memory fallback used when Upstash isn't configured
const memStore = new Map<string, { count: number; resetAt: number }>();
function allowMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Check rate limit for an identifier.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set,
 * falls back to in-memory (resets on cold start).
 *
 * @param identifier - e.g. `votes:${ip}`
 * @param limit - max requests in window
 * @param windowSeconds - window size in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const limiter = getLimiter(limit, windowSeconds);
  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return success;
  }
  return allowMemory(identifier, limit, windowSeconds * 1000);
}

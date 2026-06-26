/**
 * Simple in-memory rate limiter for Next.js middleware.
 * Note: In serverless environments, state is per-invocation and does not
 * persist across cold starts. For production, consider Upstash Redis or
 * Vercel Edge Config for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  /** Max requests within the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: config.limit - 1 };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count };
}

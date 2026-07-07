/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Keyed by an arbitrary identifier (e.g. client IP). State lives in module
 * memory, so it resets on cold-start/redeploy and is not shared across
 * serverless instances — good enough as a cheap abuse deterrent for a
 * portfolio contact form, not a hard security boundary.
 */
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const retryAfterMs = windowMs - (now - timestamps[0]);
    hits.set(key, timestamps);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= windowStart)) hits.delete(k);
    }
  }

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    retryAfterMs: 0,
  };
}

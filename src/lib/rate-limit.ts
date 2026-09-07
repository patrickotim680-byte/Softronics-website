import 'server-only';

/**
 * Minimal in-memory fixed-window rate limiter for the public contact form.
 *
 * Deliberate limitation: state lives in the process, so on a multi-instance
 * deployment each instance keeps its own counter. That is enough to blunt naive
 * spam. For production-grade limiting, swap this for Upstash Redis or Vercel
 * KV; the interface is one function.
 */
interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, window] of buckets) {
      if (window.resetAt < now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Non-reversible client identifier, so no raw IP addresses are stored. */
export async function hashIdentifier(value: string): Promise<string> {
  const data = new TextEncoder().encode(`softronics:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

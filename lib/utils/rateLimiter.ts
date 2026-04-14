/**
 * In-process sliding-window rate limiter.
 *
 * Works per Node.js instance (not shared across Vercel edge/serverless replicas).
 * For multi-instance production, replace with Upstash Redis:
 *   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Each key tracks an array of timestamps (hit log) within a rolling window.
 * Entries older than the window are pruned on every check.
 */

interface RateLimitEntry {
  hits: number[]
}

const store = new Map<string, RateLimitEntry>()

// Prune the whole store every 5 minutes to prevent unbounded memory growth.
setInterval(() => {
  const cutoff = Date.now() - 60_000
  for (const [key, entry] of store.entries()) {
    entry.hits = entry.hits.filter(t => t > cutoff)
    if (entry.hits.length === 0) store.delete(key)
  }
}, 5 * 60_000)

/**
 * Returns true if the caller should be rate-limited.
 *
 * @param key    - Unique identifier (e.g. hashed IP address)
 * @param limit  - Maximum allowed hits within the window (default: 30)
 * @param windowMs - Rolling window in milliseconds (default: 60 000 = 1 min)
 */
export function isRateLimited(
  key: string,
  limit = 30,
  windowMs = 60_000
): boolean {
  const now = Date.now()
  const cutoff = now - windowMs

  let entry = store.get(key)

  if (!entry) {
    store.set(key, { hits: [now] })
    return false
  }

  // Slide the window: drop timestamps older than cutoff
  entry.hits = entry.hits.filter(t => t > cutoff)

  if (entry.hits.length >= limit) {
    return true
  }

  entry.hits.push(now)
  return false
}

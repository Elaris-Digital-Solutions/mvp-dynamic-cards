/**
 * Sliding-window rate limiter with two backends:
 *
 * 1. Upstash Redis  — used when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *    are set. Shared across all serverless instances; production-grade.
 *    Setup: https://console.upstash.com → create a Redis database → copy the REST URL and token.
 *
 * 2. In-memory fallback — used when env vars are absent (local dev, single-instance).
 *    State is lost on process restart and is NOT shared across Vercel replicas.
 *
 * To activate Upstash, add to your environment:
 *   UPSTASH_REDIS_REST_URL=https://...upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=...
 */

import type { Ratelimit as RatelimitType } from '@upstash/ratelimit'

// ─── Upstash backend (lazily initialised) ────────────────────────────────────

let upstash: RatelimitType | null = null

async function getUpstash(): Promise<RatelimitType | null> {
  if (upstash !== null) return upstash

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis }     = await import('@upstash/redis')

    upstash = new Ratelimit({
      redis:     new Redis({ url, token }),
      limiter:   Ratelimit.slidingWindow(30, '60 s'),
      analytics: false,
      prefix:    'elaris:track',
    })
  } catch {
    // Package present but initialisation failed — fall back to in-memory
    upstash = null
  }

  return upstash
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface Bucket { hits: number[] }
const store = new Map<string, Bucket>()

setInterval(() => {
  const cutoff = Date.now() - 60_000
  for (const [key, bucket] of store.entries()) {
    bucket.hits = bucket.hits.filter(t => t > cutoff)
    if (bucket.hits.length === 0) store.delete(key)
  }
}, 5 * 60_000)

function inMemoryLimited(key: string, limit = 30, windowMs = 60_000): boolean {
  const now    = Date.now()
  const cutoff = now - windowMs
  let bucket   = store.get(key)

  if (!bucket) {
    store.set(key, { hits: [now] })
    return false
  }

  bucket.hits = bucket.hits.filter(t => t > cutoff)

  if (bucket.hits.length >= limit) return true

  bucket.hits.push(now)
  return false
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the caller should be rate-limited.
 * Async to support the Upstash backend; awaiting adds ~0 ms when using in-memory.
 *
 * @param key  - Stable identifier, e.g. a hashed IP address.
 */
export async function isRateLimited(key: string): Promise<boolean> {
  const limiter = await getUpstash()

  if (limiter) {
    const { success } = await limiter.limit(key)
    return !success
  }

  return inMemoryLimited(key)
}

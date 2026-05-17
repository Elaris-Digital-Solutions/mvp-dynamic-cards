import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ─── Upstash rate limiter (lazy singleton) ────────────────────────────────────

let profileLimiter: import('@upstash/ratelimit').Ratelimit | null = null

async function getProfileLimiter() {
  if (profileLimiter !== null) return profileLimiter

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis }     = await import('@upstash/redis')
    profileLimiter = new Ratelimit({
      redis:   new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix:  'elaris:profile',
    })
  } catch {
    profileLimiter = null
  }

  return profileLimiter
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_SEGMENTS = new Set([
  'api', '_next', 'admin', 'dashboard', 'login', 'register', 'nfc',
  'auth', 'forgot-password', 'reset-password', 'verify-email',
  'inactive', 'monitoring', 'admin-login', 'favicon.ico', 'robots.txt',
])

function isProfileRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 1 && !KNOWN_SEGMENTS.has(segments[0])
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ─── Proxy (Next.js 16 middleware) ───────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isProfileRoute(pathname)) {
    const limiter = await getProfileLimiter()
    if (limiter) {
      const ip = getIP(request)
      const { success } = await limiter.limit(ip)
      if (!success) {
        return new NextResponse('Demasiadas solicitudes. Intentá de nuevo en un minuto.', {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
        })
      }
    }
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    // Auth routes — session refresh
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/admin-login',
    '/inactive',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    // Profile routes — rate limiting
    '/((?!_next|api|auth|nfc|monitoring|favicon|robots|sitemap)[^/]+)',
  ],
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/utils/env'
import { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register') || request.nextUrl.pathname.startsWith('/admin-login')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin-login')

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin-login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    const appRole = user.app_metadata?.app_role as string | undefined
    url.pathname = appRole === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (user && (isDashboardRoute || isAdminRoute)) {
    // Prefer JWT app_metadata claims (set by sync_profile_claims_to_jwt trigger).
    // Fall back to a DB query when claims are absent (e.g. trigger hasn't run yet).
    let appRole     = user.app_metadata?.app_role as string | undefined
    let appIsActive = user.app_metadata?.app_is_active as boolean | undefined

    if (appRole === undefined || appIsActive === undefined) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()
      if (profile) {
        appRole     = appRole     ?? (profile.role as string)
        appIsActive = appIsActive ?? (profile.is_active as boolean)
      }
    }

    if (!appIsActive) {
      const url = request.nextUrl.clone()
      url.pathname = '/inactive'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && appRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

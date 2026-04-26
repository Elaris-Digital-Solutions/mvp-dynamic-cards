import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[callback] url:', request.url)
  console.log('[callback] code:', code, 'tokenHash:', tokenHash, 'type:', type)

  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    console.log('[callback] verifyOtp error:', error?.message, error?.code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=link-expirado`)
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[callback] exchangeCode error:', error?.message, error?.code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=link-expirado`)
    }
  } else {
    return NextResponse.redirect(`${origin}/login`)
  }

  if (next === '/reset-password') {
    const response = NextResponse.redirect(`${origin}/reset-password`)
    response.cookies.set('pw_reset_pending', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  return NextResponse.redirect(`${origin}${next}`)
}

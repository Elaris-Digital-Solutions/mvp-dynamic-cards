'use server'

import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils/rateLimiter'

async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const real = h.get('x-real-ip')
  return (forwarded ? forwarded.split(',')[0] : real) ?? 'unknown'
}

async function getSiteUrl(): Promise<string> {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export async function loginAction(
  email: string,
  password: string
): Promise<{ role: string | null; error?: string }> {
  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    return { role: null, error: 'Demasiados intentos. Espera un minuto antes de reintentar.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { role: null, error: 'Credenciales inválidas. Por favor intenta de nuevo.' }
    }
    if (error.code === 'email_not_confirmed' || error.message === 'Email not confirmed') {
      return { role: null, error: 'EMAIL_NOT_CONFIRMED' }
    }
    return { role: null, error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single() as any

  return { role: profile?.role ?? null }
}

export async function adminLoginAction(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    return { error: 'Demasiados intentos. Espera un minuto antes de reintentar.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Credenciales inválidas. Por favor intenta de nuevo.' }
    }
    if (error.code === 'email_not_confirmed' || error.message === 'Email not confirmed') {
      return { error: 'EMAIL_NOT_CONFIRMED' }
    }
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single() as any

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'No tienes permisos de administrador.' }
  }

  return {}
}

async function verifyTurnstile(token: string): Promise<string | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return null

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  })
  const data = await res.json()
  if (!data.success) return 'Verificación de seguridad fallida. Inténtalo de nuevo.'
  return null
}

// Validates server-side checks only. The actual signUp must be called client-side
// so the PKCE code verifier is stored in the browser's cookie store.
export async function registerAction(
  username: string,
  turnstileToken: string
): Promise<{ error?: string }> {
  if (!username) return { error: 'El nombre de usuario es requerido para tu tarjeta.' }

  const turnstileError = await verifyTurnstile(turnstileToken)
  if (turnstileError) return { error: turnstileError }

  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    return { error: 'Demasiados intentos. Espera un minuto antes de reintentar.' }
  }

  return {}
}

export async function resendVerificationEmailAction(email: string): Promise<{ error?: string }> {
  const ip = await getClientIp()

  // Límite estricto: 3 reenvíos por minuto por IP para proteger el cupo diario de Resend
  if (await isRateLimited(`resend:${ip}`)) {
    return { error: 'Demasiadas solicitudes. Espera un momento antes de reintentar.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })

  if (error) return { error: 'No se pudo reenviar el correo. Intenta de nuevo.' }
  return {}
}

export async function requestPasswordResetAction(email: string): Promise<{ error?: string }> {
  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    return { error: 'Demasiados intentos. Espera un minuto antes de reintentar.' }
  }

  const siteUrl = await getSiteUrl()
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  // Siempre retornamos éxito para no revelar si el email existe (email enumeration)
  return {}
}

export async function updatePasswordAction(password: string): Promise<{ error?: string }> {
  const cookieStore = await cookies()

  if (cookieStore.get('pw_reset_pending')?.value !== '1') {
    return { error: 'Sesión de restablecimiento inválida. Solicita un nuevo enlace.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    if (error.message.toLowerCase().includes('different from the old password') || error.message.toLowerCase().includes('same password')) {
      return { error: 'La nueva contraseña no puede ser igual a la actual.' }
    }
    return { error: 'No se pudo actualizar la contraseña. Intenta de nuevo.' }
  }

  cookieStore.delete('pw_reset_pending')
  return {}
}

'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils/rateLimiter'

async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const real = h.get('x-real-ip')
  return (forwarded ? forwarded.split(',')[0] : real) ?? 'unknown'
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
    return { role: null, error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single() as any

  return { role: profile?.role ?? null }
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

export async function registerAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
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

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        first_name: firstName,
        last_name: lastName,
        full_name: [firstName, lastName].filter(Boolean).join(' '),
      },
    },
  })

  if (error) {
    if (error.message.includes('User already registered') || error.message.includes('already exists')) {
      return { error: 'Este email ya está en uso.' }
    }
    return { error: error.message }
  }

  return {}
}

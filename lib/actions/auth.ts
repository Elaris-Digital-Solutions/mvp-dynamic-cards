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

export async function loginAction(email: string, password: string): Promise<{ role: string | null }> {
  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    throw new Error('Demasiados intentos. Espera un minuto antes de reintentar.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      throw new Error('Credenciales inválidas. Por favor intenta de nuevo.')
    }
    throw new Error(error.message)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single() as any

  return { role: profile?.role ?? null }
}

async function verifyTurnstile(token: string): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return // Sin secret (dev local) se omite la verificación

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  })
  const data = await res.json()
  if (!data.success) throw new Error('Verificación de seguridad fallida. Inténtalo de nuevo.')
}

export async function registerAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  username: string,
  turnstileToken: string
): Promise<void> {
  if (!username) throw new Error('El nombre de usuario es requerido para tu tarjeta.')

  await verifyTurnstile(turnstileToken)

  const ip = await getClientIp()

  if (await isRateLimited(`auth:${ip}`)) {
    throw new Error('Demasiados intentos. Espera un minuto antes de reintentar.')
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
      throw new Error('Este email ya está en uso.')
    }
    throw new Error(error.message)
  }
}

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Solo rutas que necesitan auth.getUser() — excluye páginas públicas (/[username], /nfc, /)
// para evitar ~100 ms extra de latencia por request en las rutas más visitadas.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/admin-login',
    '/inactive',
    '/verify-email',
  ],
}

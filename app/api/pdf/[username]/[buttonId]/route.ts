import { NextRequest } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string; buttonId: string }> }
) {
  const { username, buttonId } = await params
  const supabase = createPublicClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('public_profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) return new Response('Not found', { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: button } = await (supabase as any)
    .from('action_buttons')
    .select('url')
    .match({ id: buttonId, profile_id: profile.id, icon: 'brochure' })
    .maybeSingle()

  if (!button) return new Response('Not found', { status: 404 })

  const pdfResponse = await fetch(button.url)
  if (!pdfResponse.ok) return new Response('Failed to fetch PDF', { status: 502 })

  return new Response(pdfResponse.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

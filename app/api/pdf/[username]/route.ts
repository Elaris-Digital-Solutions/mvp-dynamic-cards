import { NextRequest } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = createPublicClient()

  const { data: profile } = await (supabase as any)
    .from('public_profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) return new Response('Not found', { status: 404 })

  const { data: button } = await (supabase as any)
    .from('action_buttons')
    .select('url')
    .match({ profile_id: profile.id, icon: 'brochure', is_managed: true })
    .maybeSingle()

  if (!button) return new Response('No brochure found', { status: 404 })

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

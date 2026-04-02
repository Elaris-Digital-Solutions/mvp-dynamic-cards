import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { profile_id, button_id } = body

    if (!profile_id || !button_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = await createClient()
    const headersList = await headers()
    
    // Attempt best-effort IP extraction cleanly
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip_hash = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'unknown'
    const user_agent = headersList.get('user-agent')

    const { error } = await supabase.from('click_events').insert({
      profile_id,
      button_id,
      event_type: 'button_click',
      user_agent,
      ip_hash
    })

    if (error) {
      console.error("Tracking API Error: ", error)
      return NextResponse.json({ error: 'Failed to record tracking' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid Payload' }, { status: 400 })
  }
}

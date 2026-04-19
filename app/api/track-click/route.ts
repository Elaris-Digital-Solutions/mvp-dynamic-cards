import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { detectPlatform } from '@/lib/utils/detectPlatform'
import { hashIp } from '@/lib/utils/hashIp'
import { isRateLimited } from '@/lib/utils/rateLimiter'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { profile_id, button_id, url, label, event_type: rawEventType } = body

    const allowed = new Set(['button_click', 'vcf_download', 'whatsapp_click'])
    const event_type = allowed.has(rawEventType) ? rawEventType : 'button_click'

    if (!profile_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const headersList = await headers()

    // Attempt best-effort IP extraction cleanly
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const reqIp = headersList.get('x-client-ip') // Some proxies

    const requestIp = forwardedFor ? forwardedFor.split(',')[0] : (realIp || reqIp || 'unknown')

    const ip_hash = await hashIp(requestIp)

    // Silently drop requests that exceed 30 events/min per IP.
    // NOTE: this is per-process only. For multi-instance production,
    // replace isRateLimited() with Upstash Redis rate limiting.
    if (await isRateLimited(ip_hash)) {
      return new NextResponse(null, { status: 204 })
    }

    const supabase = await createClient()
    const user_agent = headersList.get('user-agent')
    const platform = detectPlatform(url)

    // To prevent Next.js from killing the process before the TCP string is sent to Supabase,
    // we must await the insertion. It only takes ~50ms and prevents context termination.
    const { error } = await supabase.from('click_events' as any).insert({
      profile_id,
      button_id: button_id || null,
      event_type,
      user_agent,
      ip_hash,
      platform,
      url,
      button_label: label
    } as any)

    if (error) {
      console.error("Insert error details:", error)
    }

    // Return success via 204 No Content
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    // Fail silently on bad payload as well
    return new NextResponse(null, { status: 204 })
  }
}

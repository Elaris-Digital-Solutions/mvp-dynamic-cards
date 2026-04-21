import { NextResponse, after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { detectPlatform } from '@/lib/utils/detectPlatform'
import { hashIp } from '@/lib/utils/hashIp'
import { isRateLimited } from '@/lib/utils/rateLimiter'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { profile_id, button_id, url, label, event_type: rawEventType } = body

    const allowed = new Set(['button_click', 'vcf_download', 'whatsapp_click', 'page_view'])
    const event_type = allowed.has(rawEventType) ? rawEventType : 'button_click'

    if (!profile_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const reqIp = headersList.get('x-client-ip')
    const requestIp = forwardedFor ? forwardedFor.split(',')[0] : (realIp || reqIp || 'unknown')

    const ip_hash = await hashIp(requestIp)

    if (await isRateLimited(ip_hash)) {
      return new NextResponse(null, { status: 204 })
    }

    const user_agent = headersList.get('user-agent')
    const platform = detectPlatform(url)

    // Devolver 204 inmediatamente y procesar el insert después del response
    after(async () => {
      const supabase = await createClient()
      const { error } = await supabase.from('click_events' as any).insert({
        profile_id,
        button_id: button_id || null,
        event_type,
        user_agent,
        ip_hash,
        platform,
        url,
        button_label: label,
      } as any)

      if (error) console.error('track-click insert error:', error)
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}

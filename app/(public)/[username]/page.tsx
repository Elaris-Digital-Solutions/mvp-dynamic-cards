import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import TemplateOne from '@/components/templates/TemplateOne'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Fetch Profile STRICTLY
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile || !profile.is_active) {
    notFound()
  }

  // 2. Fetch active action buttons
  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // 3. Fire-and-Forget Page View Tracking
  // Executed silently without blocking the Next.js render thread
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  
  supabase.from('click_events').insert({
    profile_id: profile.id,
    event_type: 'page_view',
    user_agent: userAgent
  }).then(({ error }) => {
    if (error) console.error("Non-blocking page view log failed:", error.message)
  }).catch(() => {})

  // 4. Delegated Render
  if (profile.template_id === 1) {
    return <TemplateOne profile={profile} buttons={buttons || []} />
  }

  // Fallback to TemplateOne for any unmapped templates
  return <TemplateOne profile={profile} buttons={buttons || []} />
}

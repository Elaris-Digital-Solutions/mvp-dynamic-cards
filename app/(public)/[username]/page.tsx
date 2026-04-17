import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { LinktreeCard } from '@/components/card/linktree-card'
import { dbProfileToUIProfile } from '@/lib/utils/adapters'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, job_title, company, bio, avatar_url')
    .eq('username', username)
    .single() as any

  if (!profile) return { title: 'Not Found' }

  return {
    title: profile.full_name || username,
    description: [profile.job_title, profile.company, profile.bio].filter(Boolean).join(' · '),
    openGraph: {
      title: profile.full_name || username,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Fetch Profile STRICTLY
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, email, phone, whatsapp, job_title, company, bio, avatar_url, banner_url, template_id, is_active')
    .eq('username', username)
    .single() as any

  // Ensure profile exists and is explicitly marked active by an Admin
  if (!profile || !profile.is_active) {
    notFound()
  }

  // 2. Fetch active action buttons
  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('id, label, url, icon, sort_order')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // 3. Fire-and-Forget Page View Tracking
  // Executed silently without blocking the Next.js render thread
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const reqIp = headersList.get('x-client-ip')
  
  const rawIp = forwardedFor ? forwardedFor.split(',')[0] : (realIp || reqIp || 'unknown')
  const { hashIp } = await import('@/lib/utils/hashIp')
  const ip_hash = await hashIp(rawIp)

  supabase.from('click_events' as any).insert({
    profile_id: profile.id,
    event_type: 'page_view',
    user_agent: userAgent,
    ip_hash: ip_hash
  } as any).then(({ error }: any) => {
    if (error) console.error("Non-blocking page view log failed:", error.message)
  }, () => {})

  // 4. Adapt data for pure UI layer
  // The adapter strips all DB-specific columns (role, is_active, etc.)
  const uiProfile = dbProfileToUIProfile(profile, buttons || [])

  // 5. Production Render
  // selectedTemplate is widened to string by the adapter — cast to the known literal union
  const typedProfile = {
    ...uiProfile,
    id: uiProfile.id,
    selectedTemplate: uiProfile.selectedTemplate as 'minimal-black' | undefined,
  }
  return <LinktreeCard profile={typedProfile} />
}

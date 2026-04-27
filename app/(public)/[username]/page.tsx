import { cache } from 'react'
import ReactDOM from 'react-dom'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/server'
import { LinktreeCard } from '@/components/card/linktree-card'
import { dbProfileToUIProfile } from '@/lib/utils/adapters'

function cloudinaryEagerTransform(url: string | null, transform: string): string | null {
  if (!url?.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

export const revalidate = 60

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

const getProfileData = cache(async (username: string) => {
  const supabase = createPublicClient()

  // BLOQUEANTE 1: consultar la vista public_profiles en lugar de la tabla profiles
  // La vista excluye role/service_expires_at/is_active y filtra cuentas inactivas/vencidas
  const { data: profile } = await supabase
    .from('public_profiles' as any)
    .select('id, username, full_name, first_name, last_name, job_title, company, bio, avatar_url, banner_url, template_id')
    .eq('username', username)
    .single() as any

  if (!profile) return null

  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('id, label, url, icon, sort_order')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return { profile, buttons: buttons || [] }
})

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const data = await getProfileData(username)
  if (!data) return { title: 'Not Found' }
  const { profile } = data
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
  const data = await getProfileData(username)

  if (!data) notFound()

  // Preload avatar so the browser fetches it before JS runs
  const avatarPreload = cloudinaryEagerTransform(data.profile.avatar_url, 'w_200,h_200,c_fill,f_auto,q_auto')
  if (avatarPreload) {
    ReactDOM.preload(avatarPreload, { as: 'image', fetchPriority: 'high' })
  }

  const { profile, buttons } = data
  const uiProfile = dbProfileToUIProfile(profile, buttons)
  const typedProfile = {
    ...uiProfile,
    id: uiProfile.id,
    selectedTemplate: uiProfile.selectedTemplate as 'minimal-black' | undefined,
  }
  return <LinktreeCard profile={typedProfile} />
}

import type { Metadata } from 'next'
import { LinktreeCard } from '@/components/card/linktree-card'
import { MOCK_PUBLIC_PROFILE } from '@/lib/mock-data'

type PublicProfilePageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  // Integration point: fetch real profile by username and return dynamic metadata.
  const { username } = await params
  const profile = MOCK_PUBLIC_PROFILE

  return {
    title: profile.name,
    description: [profile.title, profile.company, profile.bio].filter(Boolean).join(' · '),
    openGraph: {
      title: profile.name,
      images: profile.profileImage ? [{ url: profile.profileImage }] : [],
    },
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  // Integration point: replace this block with a real profile fetch.
  //   const { username } = await params
  //   const profile = await profileService.getProfileByUsername(username)
  //   if (!profile) notFound()

  const profile = MOCK_PUBLIC_PROFILE

  return <LinktreeCard profile={profile} />
}

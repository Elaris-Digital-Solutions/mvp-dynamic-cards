import { LinktreeCard } from '@/components/card/linktree-card'
import { MOCK_USER } from '@/lib/mock-data'

export default function CardPage() {
  return (
    <div className="min-h-screen">
      {/*
       * Integration point: replace MOCK_USER with the authenticated user's profile.
       * Example (server component):
       *   const profile = await getAuthenticatedUserProfile()
       *   <LinktreeCard profile={profile} />
       */}
      <LinktreeCard profile={MOCK_USER} />
    </div>
  )
}

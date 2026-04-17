import { LinktreeCardSkeleton } from '@/components/skeletons/LinktreeCardSkeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-6 md:py-8">
      <LinktreeCardSkeleton />
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

export function LinktreeCardSkeleton() {
  return (
    <div className="w-full max-w-[390px] md:max-w-[430px] overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_70px_-30px_rgba(0,0,0,0.8)]">
      {/* Banner */}
      <Skeleton className="h-28 md:h-32 w-full rounded-none bg-primary/25" />

      {/* Avatar + content */}
      <div className="relative px-6 pt-0 pb-6">
        {/* Avatar overlapping banner */}
        <div className="relative h-0">
          <Skeleton className="absolute left-1/2 -translate-x-1/2 -top-12 h-24 w-24 rounded-3xl" />
        </div>

        {/* Profile text */}
        <div className="flex flex-col items-center pt-14 gap-2">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md mt-1" />
          <div className="w-full mt-1 space-y-1.5">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 mx-auto rounded-md" />
          </div>
        </div>

        {/* Save contact button */}
        <Skeleton className="h-10 w-full rounded-xl mt-5" />

        {/* Link rows */}
        <div className="mt-4 space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar skeleton */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-4 md:p-5 flex flex-col gap-3">
        <Skeleton className="h-8 w-32 rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div className="mt-auto space-y-2 hidden md:block">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <div>
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-5 w-80 rounded-md mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emotional payoff */}
      <Skeleton className="h-20 w-full rounded-xl" />

      {/* Action queue */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="rounded-xl border divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent wins */}
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

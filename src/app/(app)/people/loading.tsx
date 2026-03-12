import { Skeleton } from '@/components/ui/skeleton'

export default function PeopleLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Search + tabs */}
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Person cards grid */}
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

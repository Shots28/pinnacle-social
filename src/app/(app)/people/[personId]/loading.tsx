import { Skeleton } from '@/components/ui/skeleton'

export default function PersonDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-20" />

      {/* Person header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Content cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

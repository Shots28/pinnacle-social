import { Skeleton } from '@/components/ui/skeleton'

export default function FollowUpsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Follow-up cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 flex items-start gap-4">
            <Skeleton className="h-5 w-5 rounded mt-0.5" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { PartyPopper } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/dates'
import type { DashboardStats } from '@/lib/types/app'

interface RecentWinsProps {
  milestones: DashboardStats['recent_milestones']
}

export function RecentWins({ milestones }: RecentWinsProps) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No recent milestones yet. Keep going!
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {milestones.map((milestone) => (
        <li key={milestone.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <PartyPopper className="h-4 w-4 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{milestone.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{milestone.person_name}</span>
              {milestone.goal_title && (
                <>
                  <span>&middot;</span>
                  <span className="truncate">{milestone.goal_title}</span>
                </>
              )}
              <span>&middot;</span>
              <span>{formatRelativeTime(milestone.completed_at)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

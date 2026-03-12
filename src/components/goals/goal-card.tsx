import Link from 'next/link'
import { Target, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DimensionBadge } from '@/components/shared/dimension-badge'
import { GoalProgressRing } from '@/components/goals/goal-progress-ring'
import { formatDate } from '@/lib/utils/dates'
import type { Goal, Milestone, LifeDimension, GoalStatus } from '@/lib/types/app'

interface GoalCardProps {
  goal: Goal & {
    milestones: Milestone[]
    life_dimensions: Pick<LifeDimension, 'name' | 'color'> | null
  }
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  abandoned: { label: 'Abandoned', className: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export function GoalCard({ goal }: GoalCardProps) {
  const completedMilestones = goal.milestones.filter((m) => m.is_completed).length
  const totalMilestones = goal.milestones.length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
  const status = statusConfig[goal.status]

  return (
    <Link href={`/people/${goal.person_id}/goals/${goal.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent>
          <div className="flex items-start gap-5">
            <GoalProgressRing progress={progress} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {goal.life_dimensions && (
                  <DimensionBadge
                    name={goal.life_dimensions.name}
                    color={goal.life_dimensions.color ?? '#6b7280'}
                  />
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {completedMilestones}/{totalMilestones} milestones
                </span>
                {goal.target_date && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(goal.target_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

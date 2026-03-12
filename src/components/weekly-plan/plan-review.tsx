'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Trophy, CheckCircle } from 'lucide-react'

interface PlanReviewStats {
  interaction_count: number
  milestones_completed: number
  commitments_completed: number
}

interface PlanReviewProps {
  stats: PlanReviewStats
}

export function PlanReview({ stats }: PlanReviewProps) {
  const metrics = [
    {
      label: 'Interactions Logged',
      value: stats.interaction_count,
      icon: MessageCircle,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      label: 'Milestones Hit',
      value: stats.milestones_completed,
      icon: Trophy,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Commitments Completed',
      value: stats.commitments_completed,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Week in Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${metric.bg}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

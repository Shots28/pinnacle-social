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
                className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-all hover:shadow-md hover:border-teal-200"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${metric.bg}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground/90">{metric.value}</span>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

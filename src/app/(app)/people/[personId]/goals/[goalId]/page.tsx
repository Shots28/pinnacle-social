import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { DimensionBadge } from '@/components/shared/dimension-badge'
import { GoalProgressRing } from '@/components/goals/goal-progress-ring'
import { MilestoneChecklist } from '@/components/goals/milestone-checklist'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils/dates'
import type { GoalStatus } from '@/lib/types/app'

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  abandoned: { label: 'Abandoned', className: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ personId: string; goalId: string }>
}) {
  const { personId, goalId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal } = await supabase
    .from('goals')
    .select('*, milestones(*), life_dimensions(name, color)')
    .eq('id', goalId)
    .eq('person_id', personId)
    .single()

  if (!goal) redirect(`/people/${personId}/goals`)


  const completedMilestones = goal.milestones.filter((m) => m.is_completed).length
  const totalMilestones = goal.milestones.length
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
  const status = statusConfig[goal.status]

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title={goal.title}
        backHref={`/people/${personId}/goals`}
        action={
          <div className="flex gap-2">
            <Link href={`/people/${personId}/goals/${goalId}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </Link>
            <DeleteGoalButton goalId={goalId} personId={personId} />
          </div>
        }
      />

      <div className="space-y-6">
        {/* Status and dimension */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
          {goal.life_dimensions && (
            <DimensionBadge
              name={goal.life_dimensions.name}
              color={goal.life_dimensions.color ?? '#6b7280'}
            />
          )}
          {goal.target_date && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Target: {formatDate(goal.target_date)}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <GoalProgressRing progress={progress} size={64} strokeWidth={5} />
          <div>
            <p className="text-sm font-medium">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
            <p className="text-xs text-muted-foreground">
              {progress === 100
                ? 'Goal achieved!'
                : `${Math.round(progress)}% complete`}
            </p>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <>
            <Separator />
            <div>
              <h2 className="text-sm font-semibold mb-2">Description</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {goal.description}
              </p>
            </div>
          </>
        )}

        {/* Milestones */}
        <Separator />
        <div>
          <h2 className="text-sm font-semibold mb-3">Milestones</h2>
          {totalMilestones > 0 ? (
            <MilestoneChecklist
              milestones={goal.milestones}
              goalId={goal.id}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No milestones added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteGoalButton({ goalId, personId }: { goalId: string; personId: string }) {
  return (
    <form
      action={async () => {
        'use server'
        const supabase = await createClient()
        await supabase.from('milestones').delete().eq('goal_id', goalId)
        await supabase.from('goals').delete().eq('id', goalId)
        redirect(`/people/${personId}/goals`)
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="gap-1 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </form>
  )
}

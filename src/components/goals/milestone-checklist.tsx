'use client'

import { useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CelebrationModal } from '@/components/shared/celebration-modal'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/lib/types/app'

interface MilestoneChecklistProps {
  milestones: Milestone[]
  goalId: string
  onUpdate?: () => void
}

export function MilestoneChecklist({ milestones: initialMilestones, goalId, onUpdate }: MilestoneChecklistProps) {
  const supabase = createClient()
  const [milestones, setMilestones] = useState(initialMilestones)
  const [loading, setLoading] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleCloseCelebration = useCallback(() => setShowCelebration(false), [])

  async function toggleMilestone(milestone: Milestone) {
    if (milestone.is_completed) return
    setLoading(milestone.id)

    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('milestones')
        .update({ is_completed: true, completed_at: now })
        .eq('id', milestone.id)

      if (error) throw error

      const updated = milestones.map((m) =>
        m.id === milestone.id ? { ...m, is_completed: true, completed_at: now } : m
      )
      setMilestones(updated)

      // Check if all milestones are now completed
      const allCompleted = updated.every((m) => m.is_completed)
      if (allCompleted && updated.length > 0) {
        await supabase
          .from('goals')
          .update({ status: 'completed', completed_at: now })
          .eq('id', goalId)

        setShowCelebration(true)
      }

      toast.success('Milestone completed!', {
        action: {
          label: 'Undo',
          onClick: async () => {
            await supabase
              .from('milestones')
              .update({ is_completed: false, completed_at: null })
              .eq('id', milestone.id)
            if (allCompleted) {
              await supabase
                .from('goals')
                .update({ status: 'active', completed_at: null })
                .eq('id', goalId)
            }
            setMilestones((prev) =>
              prev.map((m) =>
                m.id === milestone.id ? { ...m, is_completed: false, completed_at: null } : m
              )
            )
            onUpdate?.()
          },
        },
      })
      onUpdate?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update milestone')
    } finally {
      setLoading(null)
    }
  }

  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <>
      <div className="space-y-2">
        {sorted.map((milestone) => (
          <button
            key={milestone.id}
            onClick={() => toggleMilestone(milestone)}
            disabled={milestone.is_completed || loading === milestone.id}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              milestone.is_completed
                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                : 'border-border hover:bg-accent',
              loading === milestone.id && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                milestone.is_completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground/30'
              )}
            >
              {milestone.is_completed && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium',
                  milestone.is_completed && 'line-through text-muted-foreground'
                )}
              >
                {milestone.title}
              </p>
              {milestone.completed_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completed {formatDate(milestone.completed_at)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <CelebrationModal
        show={showCelebration}
        message="Goal complete! All milestones achieved!"
        onClose={handleCloseCelebration}
      />
    </>
  )
}

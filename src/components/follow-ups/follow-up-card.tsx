'use client'

import { useState } from 'react'
import { Clock, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'
import type { FollowUp, Person } from '@/lib/types/app'

interface FollowUpCardProps {
  followUp: FollowUp & {
    people?: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
  }
  showPerson?: boolean
}

export function FollowUpCard({ followUp, showPerson = true }: FollowUpCardProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(followUp.is_completed)

  const personName = followUp.people
    ? `${followUp.people.first_name}${followUp.people.last_name ? ` ${followUp.people.last_name}` : ''}`
    : null

  const scheduledDate = new Date(followUp.scheduled_at)
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  async function handleToggle() {
    setLoading(true)
    const newCompleted = !completed
    setCompleted(newCompleted)

    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq('id', followUp.id)

      if (error) throw error
      toast.success(newCompleted ? 'Follow-up completed' : 'Follow-up reopened')
      router.refresh()
    } catch (err) {
      setCompleted(!newCompleted) // Revert
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn(completed && 'opacity-60')}>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="pt-0.5">
            <Checkbox
              checked={completed}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3
              className={cn(
                'font-semibold text-sm',
                completed && 'line-through text-muted-foreground'
              )}
            >
              {followUp.title}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {showPerson && personName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {personName}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(followUp.scheduled_at)} at {formattedTime}
              </span>
            </div>
            {followUp.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {followUp.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

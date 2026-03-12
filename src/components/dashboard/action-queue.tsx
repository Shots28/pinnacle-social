'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, CalendarClock, MessageCircleWarning } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, daysOverdue } from '@/lib/utils/dates'
import type { FollowUp, Person } from '@/lib/types/app'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button-variants'
import { PersonAvatar } from '@/components/people/person-avatar'

type FollowUpWithPerson = FollowUp & {
  people: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
}

interface ActionQueueProps {
  overduePeople: Person[]
  followUps: FollowUpWithPerson[]
}

export function ActionQueue({ overduePeople, followUps }: ActionQueueProps) {
  const [completedFollowUps, setCompletedFollowUps] = useState<Set<string>>(new Set())

  async function handleCompleteFollowUp(followUpId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('follow_ups')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', followUpId)

    if (error) {
      toast.error('Failed to complete follow-up')
      return
    }

    setCompletedFollowUps((prev) => new Set(prev).add(followUpId))
    toast.success('Follow-up completed! Momentum +1', {
      action: {
        label: 'Undo',
        onClick: async () => {
          const supabase2 = createClient()
          await supabase2
            .from('follow_ups')
            .update({ is_completed: false, completed_at: null })
            .eq('id', followUpId)
          setCompletedFollowUps((prev) => {
            const next = new Set(prev)
            next.delete(followUpId)
            return next
          })
        },
      },
    })
  }

  const hasNoActions = overduePeople.length === 0 && followUps.length === 0

  if (hasNoActions) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed border-muted-foreground/25">
        <div className="h-12 w-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-lg font-medium">You are all caught up</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          No overdue check-ins or pending follow-ups. Enjoy the peace of mind.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <ul className="divide-y divide-border/50 bg-card rounded-xl border shadow-sm max-h-[600px] overflow-y-auto">
        
        {/* Render Overdue Check-ins first (Highest Priority) */}
        {overduePeople.map((person) => {
          const overdueCount = daysOverdue(person.last_contact_at, person.contact_rhythm_days)
          return (
            <li key={`person-${person.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
              <div className="flex-shrink-0">
                 <div className="h-10 w-10 flex border-2 border-red-100 dark:border-red-900/30 rounded-full items-center justify-center bg-red-50 dark:bg-red-900/10">
                   <MessageCircleWarning className="h-4 w-4 text-red-600" />
                 </div>
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/people/${person.id}`}
                  className="text-sm font-semibold hover:underline flex items-center gap-2"
                >
                  {person.first_name} {person.last_name}
                </Link>
                <p className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1">
                  Overdue by {overdueCount} {overdueCount === 1 ? 'day' : 'days'}
                </p>
              </div>
              <Link 
                href={`/people/${person.id}/interactions?action=log`}
                className={cn(buttonVariants({ size: "sm" }), "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity")}
              >
                Log Check-in
              </Link>
            </li>
          )
        })}

        {/* Render Follow-ups */}
        {followUps.map((followUp) => {
          const isCompleted = completedFollowUps.has(followUp.id)
          return (
            <li
              key={`followup-${followUp.id}`}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-all group",
                isCompleted && "bg-muted/40 opacity-50"
              )}
            >
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full shadow-sm flex-shrink-0 transition-colors",
                  isCompleted 
                    ? "bg-teal-500 border-teal-600 text-white" 
                    : "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
                )}
                disabled={isCompleted}
                onClick={() => handleCompleteFollowUp(followUp.id)}
              >
                <Check className={cn("h-5 w-5", isCompleted ? "text-white" : "")} />
              </Button>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium transition-all", isCompleted && "line-through text-muted-foreground")}>
                  {followUp.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {followUp.people && (
                    <>
                      <Link
                        href={`/people/${followUp.people.id}`}
                        className="hover:underline font-medium text-foreground/80"
                      >
                        {followUp.people.first_name} {followUp.people.last_name}
                      </Link>
                      <span>&middot;</span>
                    </>
                  )}
                  <span>{formatRelativeTime(followUp.scheduled_at)}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

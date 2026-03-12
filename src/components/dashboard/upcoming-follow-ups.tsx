'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/dates'
import type { FollowUp, Person } from '@/lib/types/app'
import { toast } from 'sonner'

type FollowUpWithPerson = FollowUp & {
  people: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
}

interface UpcomingFollowUpsProps {
  followUps: FollowUpWithPerson[]
}

export function UpcomingFollowUps({ followUps }: UpcomingFollowUpsProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  async function handleComplete(followUpId: string) {
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

    setCompletedIds((prev) => new Set(prev).add(followUpId))
    toast.success('Follow-up completed!')
  }

  if (followUps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No upcoming follow-ups scheduled.
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {followUps.map((followUp) => {
        const isCompleted = completedIds.has(followUp.id)
        return (
          <li
            key={followUp.id}
            className={`flex items-center gap-3 py-4 first:pt-0 last:pb-0 ${isCompleted ? 'opacity-50' : ''}`}
          >
            <Button
              variant="outline"
              size="icon-sm"
              className={isCompleted ? 'bg-teal-100 border-teal-300 dark:bg-teal-900 dark:border-teal-700' : ''}
              disabled={isCompleted}
              onClick={() => handleComplete(followUp.id)}
            >
              <Check className={`h-4 w-4 ${isCompleted ? 'text-teal-600' : ''}`} />
            </Button>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through' : ''}`}>
                {followUp.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {followUp.people && (
                  <Link
                    href={`/people/${followUp.people.id}`}
                    className="hover:underline"
                  >
                    {followUp.people.first_name} {followUp.people.last_name}
                  </Link>
                )}
                <span>&middot;</span>
                <span>{formatRelativeTime(followUp.scheduled_at)}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

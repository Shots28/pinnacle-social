import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { FollowUpCard } from '@/components/follow-ups/follow-up-card'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

function getGroupLabel(scheduledAt: string): string {
  const now = new Date()
  const scheduled = new Date(scheduledAt)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const scheduledDay = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate())
  const diffDays = Math.floor((scheduledDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays <= 7) return 'This Week'
  return 'Later'
}

const groupOrder = ['Overdue', 'Today', 'This Week', 'Later'] as const

export default async function FollowUpsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: followUps } = await supabase
    .from('follow_ups')
    .select('*, people(id, first_name, last_name)')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .order('scheduled_at', { ascending: true })

  // Group follow-ups
  const groups = new Map<string, NonNullable<typeof followUps>>()
  for (const group of groupOrder) {
    groups.set(group, [])
  }

  for (const fu of followUps ?? []) {
    const label = getGroupLabel(fu.scheduled_at)
    groups.get(label)!.push(fu)
  }

  const hasFollowUps = (followUps?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title="Follow-ups"
        description="Scheduled reminders to follow up with people"
        action={
          <Link href="/follow-ups/new" className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700 gap-1")}>
              <Plus className="h-4 w-4" />
              Schedule Follow-up
          </Link>
        }
      />

      {!hasFollowUps ? (
        <EmptyState
          icon={Bell}
          title="No follow-ups scheduled"
          description="Schedule follow-ups to remind yourself to check in with the people who matter."
          actionLabel="Schedule Follow-up"
          actionHref="/follow-ups/new"
        />
      ) : (
        <div className="space-y-8">
          {groupOrder.map((group) => {
            const items = groups.get(group)!
            if (items.length === 0) return null

            return (
              <div key={group}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  {group}
                  {group === 'Overdue' && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">
                      {items.length}
                    </span>
                  )}
                </h2>
                <div className="space-y-3">
                  {items.map((fu) => (
                    <FollowUpCard key={fu.id} followUp={fu} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

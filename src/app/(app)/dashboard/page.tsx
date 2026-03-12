import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsRow } from '@/components/dashboard/stats-row'
import { EmotionalPayoff } from '@/components/dashboard/emotional-payoff'
import { ActionQueue } from '@/components/dashboard/action-queue'
import { RecentWins } from '@/components/dashboard/recent-wins'
import type { DashboardStats } from '@/lib/types/app'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all data in parallel
  const now = new Date()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    { data: allPeople },
    { count: pendingCommitmentsCount },
    { count: todaysFollowUpsCount },
    { count: weeklyInteractionsCount },
    { data: recentMilestones },
    { data: followUps },
  ] = await Promise.all([
    supabase
      .from('people')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('last_contact_at', { ascending: true, nullsFirst: true }),
    supabase
      .from('commitments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('follow_ups')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('scheduled_at', todayStart.toISOString())
      .lt('scheduled_at', todayEnd.toISOString()),
    supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('occurred_at', weekAgo.toISOString()),
    supabase
      .from('milestones')
      .select('*, goals(title, people(first_name, last_name))')
      .eq('is_completed', true)
      .gte('completed_at', weekAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('follow_ups')
      .select('*, people(id, first_name, last_name)')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .gte('scheduled_at', todayStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10),
  ])

  const people = allPeople ?? []
  const overduePeople = people.filter((person) => {
    if (!person.contact_rhythm_days) return false
    if (!person.last_contact_at) return true
    const diffDays = Math.floor(
      (now.getTime() - new Date(person.last_contact_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays > person.contact_rhythm_days
  }).slice(0, 5)

  const stats: DashboardStats = {
    total_people: people.length,
    overdue_checkins: overduePeople.length,
    pending_commitments: pendingCommitmentsCount ?? 0,
    todays_follow_ups: todaysFollowUpsCount ?? 0,
    weekly_interactions: weeklyInteractionsCount ?? 0,
    recent_milestones: (recentMilestones ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      completed_at: m.completed_at ?? new Date().toISOString(),
      goal_title: (m.goals as { title?: string })?.title ?? '',
      person_name: (() => {
        const p = (m.goals as { people?: { first_name: string; last_name?: string } })?.people
        return p ? `${p.first_name} ${p.last_name ?? ''}`.trim() : ''
      })(),
    })),
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${getGreeting()}! Here's how your relationships are doing.`}
      />

      <StatsRow stats={stats} />

      <EmotionalPayoff stats={stats} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your Action Queue</h2>
        <ActionQueue overduePeople={overduePeople} followUps={followUps ?? []} />
      </div>

      {stats.recent_milestones.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent Wins</h2>
          <div className="rounded-xl border bg-card p-4">
            <RecentWins milestones={stats.recent_milestones} />
          </div>
        </div>
      )}
    </div>
  )
}

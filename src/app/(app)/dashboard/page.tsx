import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsRow } from '@/components/dashboard/stats-row'
import { EmotionalPayoff } from '@/components/dashboard/emotional-payoff'
import { OverdueCheckins } from '@/components/dashboard/overdue-checkins'
import { UpcomingFollowUps } from '@/components/dashboard/upcoming-follow-ups'
import { RecentWins } from '@/components/dashboard/recent-wins'
import { QuickLogButton } from '@/components/interactions/quick-log-button'
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

  // Fetch dashboard stats via RPC
  const { data: statsData } = await supabase.rpc('get_dashboard_stats')
  const stats: DashboardStats = (statsData as DashboardStats) ?? {
    total_people: 0,
    overdue_checkins: 0,
    pending_commitments: 0,
    todays_follow_ups: 0,
    weekly_interactions: 0,
    recent_milestones: [],
  }

  // Fetch overdue people
  const { data: allPeople } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .not('contact_rhythm_days', 'is', null)
    .order('last_contact_at', { ascending: true, nullsFirst: true })

  const now = new Date()
  const overduePeople = (allPeople ?? []).filter((person) => {
    if (!person.contact_rhythm_days) return false
    if (!person.last_contact_at) return true
    const diffDays = Math.floor(
      (now.getTime() - new Date(person.last_contact_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays > person.contact_rhythm_days
  }).slice(0, 5)

  // Fetch today's and upcoming follow-ups
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const { data: followUps } = await supabase
    .from('follow_ups')
    .select('*, people(id, first_name, last_name)')
    .eq('user_id', user.id)
    .eq('is_completed', false)
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', weekEnd.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)

  // Fetch people list for quick-log button
  const { data: peopleList } = await supabase
    .from('people')
    .select('id, first_name, last_name')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${getGreeting()}! Here's how your relationships are doing.`}
      />

      <StatsRow stats={stats} />

      <EmotionalPayoff stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overdue Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <OverdueCheckins people={overduePeople} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingFollowUps followUps={followUps ?? []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wins</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentWins milestones={stats.recent_milestones} />
        </CardContent>
      </Card>

      <QuickLogButton people={peopleList ?? []} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekStart } from '@/lib/utils/dates'
import { PageHeader } from '@/components/layout/page-header'
import { PlanReview } from '@/components/weekly-plan/plan-review'
import { PlanEditor } from '@/components/weekly-plan/plan-editor'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarDays, Loader2 } from 'lucide-react'
import type { Person, WeeklyPlan } from '@/lib/types/app'

interface WeekStats {
  interaction_count: number
  milestones_completed: number
  commitments_completed: number
}

export default function WeeklyPlanPage() {
  const supabase = createClient()
  const currentWeekStart = getWeekStart()

  const [loading, setLoading] = useState(true)
  const [existingPlan, setExistingPlan] = useState<WeeklyPlan | null>(null)
  const [allPeople, setAllPeople] = useState<Person[]>([])
  const [suggestedPeople, setSuggestedPeople] = useState<Person[]>([])
  const [lastWeekStats, setLastWeekStats] = useState<WeekStats>({
    interaction_count: 0,
    milestones_completed: 0,
    commitments_completed: 0,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Calculate last week's date range
        const thisWeek = new Date(currentWeekStart)
        const lastWeekStart = new Date(thisWeek)
        lastWeekStart.setDate(lastWeekStart.getDate() - 7)
        const lastWeekEnd = new Date(thisWeek)
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

        // Fetch existing plan for current week
        const { data: planData } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_start', currentWeekStart)
          .maybeSingle()

        setExistingPlan(planData)

        // Fetch all active people
        const { data: peopleData } = await supabase
          .from('people')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('first_name')

        const people = peopleData ?? []
        setAllPeople(people)

        // Determine suggested people (those due for contact this week)
        const now = new Date()
        const suggested = people.filter((person) => {
          if (!person.contact_rhythm_days) return false
          if (!person.last_contact_at) return true
          const lastContact = new Date(person.last_contact_at)
          const daysSince = Math.floor(
            (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
          )
          // Due if days since last contact is within one rhythm period
          return daysSince >= person.contact_rhythm_days - 3
        })
        setSuggestedPeople(suggested)

        // Fetch last week stats: interactions
        const { count: interactionCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('occurred_at', lastWeekStart.toISOString())
          .lt('occurred_at', thisWeek.toISOString())

        // Fetch last week stats: milestones completed
        const { count: milestoneCount } = await supabase
          .from('milestones')
          .select('*, goals!inner(user_id)', { count: 'exact', head: true })
          .eq('goals.user_id', user.id)
          .eq('is_completed', true)
          .gte('completed_at', lastWeekStart.toISOString())
          .lt('completed_at', thisWeek.toISOString())

        // Fetch last week stats: commitments completed
        const { count: commitmentCount } = await supabase
          .from('commitments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('completed_at', lastWeekStart.toISOString())
          .lt('completed_at', thisWeek.toISOString())

        setLastWeekStats({
          interaction_count: interactionCount ?? 0,
          milestones_completed: milestoneCount ?? 0,
          commitments_completed: commitmentCount ?? 0,
        })
      } catch (err) {
        console.error('Failed to load weekly plan data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (allPeople.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Weekly Plan"
          description="Plan your relationship priorities for the week."
        />
        <EmptyState
          icon={CalendarDays}
          title="No people yet"
          description="Add some people to your circle first, then come back to plan your week."
          actionLabel="Add a Person"
          actionHref="/people/new"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly Plan"
        description={`Week of ${new Date(currentWeekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />

      <PlanReview stats={lastWeekStats} />

      <PlanEditor
        weekStart={currentWeekStart}
        existingPlan={existingPlan}
        suggestedPeople={suggestedPeople}
        allPeople={allPeople}
      />
    </div>
  )
}

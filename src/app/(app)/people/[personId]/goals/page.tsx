import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { GoalCard } from '@/components/goals/goal-card'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default async function PersonGoalsPage({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const { personId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: person } = await supabase
    .from('people')
    .select('id, first_name, last_name')
    .eq('id', personId)
    .single()

  if (!person) redirect('/people')

  const { data: goals } = await supabase
    .from('goals')
    .select('*, milestones(*), life_dimensions(name, color)')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  const personName = `${person.first_name}${person.last_name ? ` ${person.last_name}` : ''}`

  // Group goals by dimension
  const grouped = new Map<string, typeof goals>()
  const ungrouped: NonNullable<typeof goals> = []

  for (const goal of goals ?? []) {
    if (goal.life_dimensions) {
      const key = goal.life_dimensions.name
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(goal)
    } else {
      ungrouped.push(goal)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title={`${personName}'s Goals`}
        description="Track progress on meaningful goals"
        backHref={`/people/${personId}`}
        action={
          <Link href={`/people/${personId}/goals/new`} className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700 gap-1")}>
              <Plus className="h-4 w-4" />
              Add Goal
          </Link>
        }
      />

      {!goals?.length ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description={`Set meaningful goals to track ${person.first_name}'s growth and progress.`}
          actionLabel="Add Goal"
          actionHref={`/people/${personId}/goals/new`}
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([dimensionName, dimensionGoals]) => (
            <div key={dimensionName}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {dimensionName}
              </h2>
              <div className="space-y-3">
                {dimensionGoals!.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          ))}

          {ungrouped.length > 0 && (
            <div>
              {grouped.size > 0 && <Separator className="mb-6" />}
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Other
              </h2>
              <div className="space-y-3">
                {ungrouped.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

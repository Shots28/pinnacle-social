import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoalForm } from '@/components/goals/goal-form'

export default async function EditGoalPage({
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
    .select('*, milestones(id, title, sort_order)')
    .eq('id', goalId)
    .eq('person_id', personId)
    .single()

  if (!goal) notFound()

  const { data: dimensions } = await supabase
    .from('life_dimensions')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  return (
    <div>
      <PageHeader
        title="Edit Goal"
        description={`Update "${goal.title}"`}
        backHref={`/people/${personId}/goals/${goalId}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Edit Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm
            personId={personId}
            initialData={goal}
            dimensions={dimensions ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

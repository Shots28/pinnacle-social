import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoalForm } from '@/components/goals/goal-form'

export default async function NewGoalPage({
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
    .eq('user_id', user.id)
    .single()

  if (!person) notFound()

  const { data: dimensions } = await supabase
    .from('life_dimensions')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  return (
    <div>
      <PageHeader
        title="Add Goal"
        description={`Set a goal for ${person.first_name}`}
        backHref={`/people/${personId}/goals`}
      />
      <Card>
        <CardHeader>
          <CardTitle>New Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm personId={personId} dimensions={dimensions ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}

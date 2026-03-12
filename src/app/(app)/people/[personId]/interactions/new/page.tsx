import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InteractionForm } from '@/components/interactions/interaction-form'

export default async function NewInteractionPage({
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

  return (
    <div>
      <PageHeader
        title="Log Interaction"
        description={`Record an interaction with ${person.first_name}`}
        backHref={`/people/${personId}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Log Interaction</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractionForm personId={personId} />
        </CardContent>
      </Card>
    </div>
  )
}

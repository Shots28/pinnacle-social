import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FollowUpForm } from '@/components/follow-ups/follow-up-form'

export default async function NewFollowUpPage({
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
        title="Schedule Follow-up"
        description={`Plan a follow-up with ${person.first_name}`}
        backHref={`/people/${personId}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>New Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowUpForm personId={personId} />
        </CardContent>
      </Card>
    </div>
  )
}

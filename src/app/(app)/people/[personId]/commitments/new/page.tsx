import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommitmentForm } from '@/components/commitments/commitment-form'

export default async function NewCommitmentPage({
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
        title="Add Commitment"
        description={`Track a commitment with ${person.first_name}`}
        backHref={`/people/${personId}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>New Commitment</CardTitle>
        </CardHeader>
        <CardContent>
          <CommitmentForm personId={personId} />
        </CardContent>
      </Card>
    </div>
  )
}

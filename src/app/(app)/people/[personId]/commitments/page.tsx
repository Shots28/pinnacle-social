import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Handshake, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CommitmentList } from '@/components/commitments/commitment-list'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

export default async function PersonCommitmentsPage({
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

  const { data: commitments } = await supabase
    .from('commitments')
    .select('*, people(id, first_name, last_name)')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  const personName = `${person.first_name}${person.last_name ? ` ${person.last_name}` : ''}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title={`Commitments with ${personName}`}
        description="Promises made and received"
        backHref={`/people/${personId}`}
        action={
          <Link href={`/people/${personId}/commitments/new`} className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700 gap-1")}>
              <Plus className="h-4 w-4" />
              Add Commitment
          </Link>
        }
      />

      {!commitments?.length ? (
        <EmptyState
          icon={Handshake}
          title="No commitments yet"
          description={`Track commitments between you and ${person.first_name}.`}
          actionLabel="Add Commitment"
          actionHref={`/people/${personId}/commitments/new`}
        />
      ) : (
        <CommitmentList commitments={commitments} />
      )}
    </div>
  )
}

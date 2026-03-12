import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Handshake, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CommitmentList } from '@/components/commitments/commitment-list'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

export default async function CommitmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: commitments } = await supabase
    .from('commitments')
    .select('*, people(id, first_name, last_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title="Commitments"
        description="Track promises made and received"
        action={
          <Link href="/commitments/new" className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700 gap-1")}>
              <Plus className="h-4 w-4" />
              Add Commitment
          </Link>
        }
      />

      {!commitments?.length ? (
        <EmptyState
          icon={Handshake}
          title="No commitments yet"
          description="Track commitments you've made to others and commitments others have made to you."
          actionLabel="Add Commitment"
          actionHref="/commitments/new"
        />
      ) : (
        <CommitmentList commitments={commitments} showPerson />
      )}
    </div>
  )
}

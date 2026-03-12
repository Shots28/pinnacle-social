import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InteractionTimeline } from '@/components/interactions/interaction-timeline'
import { InteractionForm } from '@/components/interactions/interaction-form'
import { EmptyState } from '@/components/shared/empty-state'
import { Plus, MessageCircle } from 'lucide-react'

interface PersonInteractionsPageProps {
  params: Promise<{ personId: string }>
  searchParams: Promise<{ action?: string }>
}

export default async function PersonInteractionsPage({
  params,
  searchParams,
}: PersonInteractionsPageProps) {
  const { personId } = await params
  const { action } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .eq('user_id', user.id)
    .single()

  if (!person) notFound()

  const { data: interactions } = await supabase
    .from('interactions')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(50)

  const showForm = action === 'log'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${person.first_name}'s Interactions`}
        description={`History of interactions with ${person.first_name} ${person.last_name ?? ''}`}
        backHref={`/people/${personId}`}
        action={
          !showForm ? (
            <Link href={`/people/${personId}/interactions?action=log`} className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700")}>
                <Plus className="h-4 w-4" />
                Log Interaction
            </Link>
          ) : undefined
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <InteractionForm personId={personId} />
          </CardContent>
        </Card>
      )}

      {(interactions ?? []).length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No interactions yet"
          description={`Start logging your conversations with ${person.first_name} to build a history.`}
          actionLabel="Log First Interaction"
          actionHref={`/people/${personId}/interactions?action=log`}
        />
      ) : (
        <InteractionTimeline interactions={interactions ?? []} showPerson={false} />
      )}
    </div>
  )
}

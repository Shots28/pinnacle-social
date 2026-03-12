import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { PersonCard } from '@/components/people/person-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

interface HouseholdDetailPageProps {
  params: Promise<{ householdId: string }>
}

export default async function HouseholdDetailPage({ params }: HouseholdDetailPageProps) {
  const { householdId } = await params
  const supabase = await createClient()

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single()

  if (!household) notFound()

  const { data: members } = await supabase
    .from('people')
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div>
      <PageHeader
        title={household.name}
        description={household.notes ?? undefined}
        backHref="/households"
      />

      {members && members.length > 0 ? (
        <div className="grid gap-2">
          {members.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Add people to this household by editing their profile."
          actionLabel="Go to People"
          actionHref="/people"
        />
      )}
    </div>
  )
}

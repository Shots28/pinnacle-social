import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { PersonForm } from '@/components/people/person-form'

interface EditPersonPageProps {
  params: Promise<{ personId: string }>
}

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { personId } = await params
  const supabase = await createClient()

  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .single()

  if (!person) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${person.first_name}`}
        backHref={`/people/${person.id}`}
      />
      <PersonForm initialData={person} />
    </div>
  )
}

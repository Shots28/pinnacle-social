import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { PersonList } from '@/components/people/person-list'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function PeoplePage() {
  const supabase = await createClient()

  const { data: people } = await supabase
    .from('people')
    .select('*')
    .eq('status', 'active')
    .order('first_name')

  return (
    <div>
      <PageHeader
        title="People"
        description="The people you care about"
        action={
          <Link href="/people/new" className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700")}>
              <Plus className="mr-2 size-4" />
              Add Person
          </Link>
        }
      />
      <PersonList people={people ?? []} />
    </div>
  )
}

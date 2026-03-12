import { PageHeader } from '@/components/layout/page-header'
import { PersonForm } from '@/components/people/person-form'

export default function NewPersonPage() {
  return (
    <div>
      <PageHeader
        title="Add Person"
        description="Add someone you want to invest in"
        backHref="/people"
      />
      <PersonForm />
    </div>
  )
}

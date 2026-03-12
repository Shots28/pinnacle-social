import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { InteractionForm } from '@/components/interactions/interaction-form'

export default async function NewInteractionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: people } = await supabase
    .from('people')
    .select('id, first_name, last_name')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Interaction"
        description="Record a conversation, call, or activity."
        backHref="/interactions"
      />

      <Card>
        <CardContent className="pt-2">
          <InteractionForm people={people ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InteractionTimeline } from '@/components/interactions/interaction-timeline'
import { EmptyState } from '@/components/shared/empty-state'
import { INTERACTION_TYPES } from '@/lib/utils/constants'
import { Plus, MessageCircle } from 'lucide-react'

export default async function InteractionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: interactions } = await supabase
    .from('interactions')
    .select('*, people(id, first_name, last_name)')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(50)

  const allInteractions = interactions ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactions"
        description="Your recent conversations, calls, and activities."
        action={
          <Link href="/interactions/new" className={cn(buttonVariants(), "bg-teal-600 hover:bg-teal-700")}>
              <Plus className="h-4 w-4" />
              Log Interaction
          </Link>
        }
      />

      {allInteractions.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No interactions yet"
          description="Start logging your conversations, calls, and activities to build a history of your relationships."
          actionLabel="Log Your First Interaction"
          actionHref="/interactions/new"
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {INTERACTION_TYPES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <InteractionTimeline interactions={allInteractions} />
          </TabsContent>

          {INTERACTION_TYPES.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              <InteractionTimeline
                interactions={allInteractions.filter((i) => i.type === t.value)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

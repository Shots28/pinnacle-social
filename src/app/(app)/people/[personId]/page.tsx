import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatDate, isOverdue, daysOverdue } from '@/lib/utils/dates'
import { PageHeader } from '@/components/layout/page-header'
import { PersonAvatar } from '@/components/people/person-avatar'
import { RelationshipBadge } from '@/components/people/relationship-badge'
import { StatusDot } from '@/components/shared/status-dot'
import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  MessageCircle,
  Target,
  Handshake,
  CalendarClock,
  Pencil,
  Phone,
  Mail,
  Cake,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'

interface PersonDetailPageProps {
  params: Promise<{ personId: string }>
}

export default async function PersonDetailPage({ params }: PersonDetailPageProps) {
  const { personId } = await params
  const supabase = await createClient()

  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .single()

  if (!person) notFound()

  const [
    { data: goals },
    { data: interactions },
    { data: commitments },
  ] = await Promise.all([
    supabase
      .from('goals')
      .select('*, milestones(*)')
      .eq('person_id', personId)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('interactions')
      .select('*')
      .eq('person_id', personId)
      .order('occurred_at', { ascending: false })
      .limit(5),
    supabase
      .from('commitments')
      .select('*')
      .eq('person_id', personId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true }),
  ])

  const overdue = isOverdue(person.last_contact_at, person.contact_rhythm_days)
  const overdueDayCount = daysOverdue(person.last_contact_at, person.contact_rhythm_days)
  const fullName = `${person.first_name} ${person.last_name ?? ''}`.trim()

  return (
    <div>
      <PageHeader
        title={fullName}
        backHref="/people"
        action={
          <Link href={`/people/${person.id}/edit`} className={cn(buttonVariants({ variant: "outline" }))}>
              <Pencil className="mr-2 size-4" />
              Edit
          </Link>
        }
      />

      {/* Person header */}
      <div className="flex items-center gap-4 mb-8">
        <PersonAvatar
          firstName={person.first_name}
          lastName={person.last_name}
          avatarUrl={person.avatar_url}
          statusColor={person.status_color}
          size="lg"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{fullName}</h2>
            <RelationshipBadge type={person.relationship_type} />
            <StatusDot color={person.status_color} />
          </div>
          {overdue && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              Overdue by {overdueDayCount} {overdueDayCount === 1 ? 'day' : 'days'}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">
            Last contact: {formatRelativeTime(person.last_contact_at)}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href={`/people/${person.id}/interactions/new`} className={cn(buttonVariants({ size: "sm" }), "bg-teal-600 hover:bg-teal-700")}>
            <MessageCircle className="mr-1.5 size-3.5" />
            Log Interaction
        </Link>
        <Link href={`/people/${person.id}/goals/new`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            <Target className="mr-1.5 size-3.5" />
            Add Goal
        </Link>
        <Link href={`/people/${person.id}/commitments/new`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            <Handshake className="mr-1.5 size-3.5" />
            Add Commitment
        </Link>
        <Link href={`/people/${person.id}/follow-ups/new`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            <CalendarClock className="mr-1.5 size-3.5" />
            Schedule Follow-up
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {person.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{person.phone}</span>
              </div>
            )}
            {person.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{person.email}</span>
              </div>
            )}
            {person.birthday && (
              <div className="flex items-center gap-2 text-sm">
                <Cake className="size-4 text-muted-foreground" />
                <span>{formatDate(person.birthday)}</span>
              </div>
            )}
            {person.contact_rhythm_days && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span>Every {person.contact_rhythm_days} days</span>
              </div>
            )}
            {!person.phone && !person.email && !person.birthday && !person.contact_rhythm_days && (
              <p className="text-sm text-muted-foreground">No contact details yet.</p>
            )}
            {person.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{person.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Interactions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Interactions</CardTitle>
            <Link href={`/people/${person.id}/interactions`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>View all</Link>
          </CardHeader>
          <CardContent>
            {interactions && interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction, i) => (
                  <div key={interaction.id}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                        <MessageCircle className="size-3 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {interaction.title ?? interaction.type}
                        </p>
                        {interaction.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {interaction.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(interaction.occurred_at)}
                        </p>
                      </div>
                    </div>
                    {i < interactions.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="No interactions yet"
                description="Log your first interaction with this person."
                actionLabel="Log Interaction"
                actionHref={`/people/${person.id}/interactions/new`}
              />
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active Goals</CardTitle>
            <Link href={`/people/${person.id}/goals`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>View all</Link>
          </CardHeader>
          <CardContent>
            {goals && goals.length > 0 ? (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const milestones = goal.milestones ?? []
                  const completed = milestones.filter((m: { is_completed: boolean }) => m.is_completed).length
                  const total = milestones.length
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{goal.title}</p>
                        {goal.target_date && (
                          <span className="text-xs text-muted-foreground">
                            Due {formatDate(goal.target_date)}
                          </span>
                        )}
                      </div>
                      {total > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{goal.title}</span>
                            <span>{completed}/{total} milestones</span>
                          </div>
                          <Progress value={pct} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No active goals"
                description="Set a goal for this person."
                actionLabel="Add Goal"
                actionHref={`/people/${person.id}/goals/new`}
              />
            )}
          </CardContent>
        </Card>

        {/* Pending Commitments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending Commitments</CardTitle>
            <Link href={`/people/${person.id}/commitments`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>View all</Link>
          </CardHeader>
          <CardContent>
            {commitments && commitments.length > 0 ? (
              <div className="space-y-4">
                {commitments.map((commitment) => {
                  const isCommitmentOverdue =
                    commitment.due_date &&
                    new Date(commitment.due_date) < new Date() &&
                    commitment.status !== 'completed'

                  return (
                    <div key={commitment.id} className="flex items-start gap-3">
                      {isCommitmentOverdue ? (
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCommitmentOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                          {commitment.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commitment.committed_by === 'me' ? 'You committed' : 'They committed'}
                          {commitment.due_date && ` · Due ${formatDate(commitment.due_date)}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No pending commitments"
                description="All caught up! Add a new commitment when needed."
                actionLabel="Add Commitment"
                actionHref={`/people/${person.id}/commitments/new`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

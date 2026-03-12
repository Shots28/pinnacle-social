import Link from 'next/link'
import type { Person } from '@/lib/types/app'
import { formatRelativeTime, isOverdue, daysOverdue } from '@/lib/utils/dates'
import { PersonAvatar } from '@/components/people/person-avatar'
import { RelationshipBadge } from '@/components/people/relationship-badge'
import { Card } from '@/components/ui/card'
import { AlertCircle, MessageSquarePlus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PersonCardProps {
  person: Person
}

export function PersonCard({ person }: PersonCardProps) {
  const overdue = isOverdue(person.last_contact_at, person.contact_rhythm_days)
  const overdueDays = daysOverdue(person.last_contact_at, person.contact_rhythm_days)

  return (
    <Link href={`/people/${person.id}`}>
      <Card className="group relative overflow-hidden border-muted-foreground/10 transition-all hover:border-teal-200 hover:shadow-md cursor-pointer bg-card hover:bg-teal-50/30">
        <div className="flex items-center gap-4 p-4">
          <PersonAvatar
            firstName={person.first_name}
            lastName={person.last_name}
            avatarUrl={person.avatar_url}
            statusColor={person.status_color}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate text-foreground/90 group-hover:text-teal-900 transition-colors">
                {person.first_name} {person.last_name}
              </span>
              <RelationshipBadge type={person.relationship_type} />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Last contact: {formatRelativeTime(person.last_contact_at)}
              </span>
              {overdue && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full uppercase">
                  <AlertCircle className="size-3" />
                  Overdue ({overdueDays}d)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-teal-200 text-teal-700 hover:bg-teal-100 hover:text-teal-900 z-10"
              onClick={(e) => {
                e.preventDefault()
                // In a future update, this could open the Universal Action Bar directly for this user.
                // For now, it routes to the dedicated log page.
                window.location.href = `/people/${person.id}/interactions?action=log`
              }}
              title="Quick Log"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

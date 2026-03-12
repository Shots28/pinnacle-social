import Link from 'next/link'
import type { Person } from '@/lib/types/app'
import { formatRelativeTime, isOverdue, daysOverdue } from '@/lib/utils/dates'
import { PersonAvatar } from '@/components/people/person-avatar'
import { RelationshipBadge } from '@/components/people/relationship-badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface PersonCardProps {
  person: Person
}

export function PersonCard({ person }: PersonCardProps) {
  const overdue = isOverdue(person.last_contact_at, person.contact_rhythm_days)
  const overdueDays = daysOverdue(person.last_contact_at, person.contact_rhythm_days)

  return (
    <Link href={`/people/${person.id}`}>
      <Card size="sm" className="transition-colors hover:bg-accent/50 cursor-pointer">
        <CardContent className="flex items-center gap-3">
          <PersonAvatar
            firstName={person.first_name}
            lastName={person.last_name}
            avatarUrl={person.avatar_url}
            statusColor={person.status_color}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {person.first_name} {person.last_name}
              </span>
              <RelationshipBadge type={person.relationship_type} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                Last contact: {formatRelativeTime(person.last_contact_at)}
              </span>
              {overdue && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="size-3" />
                  Overdue by {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PersonAvatar } from '@/components/people/person-avatar'
import { daysOverdue } from '@/lib/utils/dates'
import type { Person } from '@/lib/types/app'

interface OverdueCheckinsProps {
  people: Person[]
}

export function OverdueCheckins({ people }: OverdueCheckinsProps) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No overdue check-ins. You are all caught up!
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <ul className="divide-y">
        {people.map((person) => {
          const overdueDays = daysOverdue(person.last_contact_at, person.contact_rhythm_days)
          return (
            <li key={person.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <PersonAvatar
                firstName={person.first_name}
                lastName={person.last_name}
                avatarUrl={person.avatar_url}
                statusColor={person.status_color}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/people/${person.id}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {person.first_name} {person.last_name}
                </Link>
                <p className="text-xs text-red-600">
                  Overdue by {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
                </p>
              </div>
              <Link href={`/people/${person.id}/interactions?action=log`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Log Check-in
              </Link>
            </li>
          )
        })}
      </ul>
      {people.length >= 5 && (
        <div className="pt-2">
          <Link href="/people?filter=overdue" className={cn(buttonVariants({ variant: "link", size: "sm" }), "text-teal-600 px-0")}>View all overdue</Link>
        </div>
      )}
    </div>
  )
}

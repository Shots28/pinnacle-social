import { formatRelativeTime, formatDate } from '@/lib/utils/dates'
import { INTERACTION_TYPES } from '@/lib/utils/constants'
import type { Interaction, Person } from '@/lib/types/app'

type InteractionWithPerson = Interaction & {
  people?: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
}

interface InteractionTimelineProps {
  interactions: InteractionWithPerson[]
  showPerson?: boolean
}

const typeColorMap: Record<string, string> = {
  conversation: 'bg-blue-500',
  activity: 'bg-green-500',
  check_in: 'bg-teal-500',
  call: 'bg-purple-500',
  text: 'bg-indigo-500',
  visit: 'bg-orange-500',
  other: 'bg-gray-400',
}

function groupByDate(interactions: InteractionWithPerson[]) {
  const groups: Map<string, InteractionWithPerson[]> = new Map()
  for (const interaction of interactions) {
    const dateKey = formatDate(interaction.occurred_at)
    const existing = groups.get(dateKey)
    if (existing) {
      existing.push(interaction)
    } else {
      groups.set(dateKey, [interaction])
    }
  }
  return groups
}

export function InteractionTimeline({ interactions, showPerson = true }: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No interactions yet.
      </p>
    )
  }

  const grouped = groupByDate(interactions)

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {date}
          </h3>
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
            {items.map((interaction) => {
              const typeInfo = INTERACTION_TYPES.find((t) => t.value === interaction.type)
              const dotColor = typeColorMap[interaction.type] ?? 'bg-gray-400'
              return (
                <div key={interaction.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {/* Dot */}
                  <div className="relative z-10 mt-1.5">
                    <div className={`h-[18px] w-[18px] rounded-full border-2 border-background ${dotColor}`} />
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground">
                        {typeInfo?.label ?? interaction.type}
                      </span>
                      {interaction.title && (
                        <span className="text-sm font-medium">{interaction.title}</span>
                      )}
                    </div>
                    {showPerson && interaction.people && (
                      <p className="text-xs text-muted-foreground">
                        {interaction.people.first_name} {interaction.people.last_name}
                      </p>
                    )}
                    {interaction.notes && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {interaction.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatRelativeTime(interaction.occurred_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

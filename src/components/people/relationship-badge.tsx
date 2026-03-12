import { cn } from '@/lib/utils'
import type { RelationshipType } from '@/lib/types/app'

const colorMap: Record<RelationshipType, string> = {
  child: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  friend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  family: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  mentee: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  colleague: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
}

const labelMap: Record<RelationshipType, string> = {
  child: 'Child',
  friend: 'Friend',
  family: 'Family',
  mentee: 'Mentee',
  colleague: 'Colleague',
  other: 'Other',
}

interface RelationshipBadgeProps {
  type: RelationshipType
  className?: string
}

export function RelationshipBadge({ type, className }: RelationshipBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorMap[type],
        className
      )}
    >
      {labelMap[type]}
    </span>
  )
}

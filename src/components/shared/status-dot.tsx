import { cn } from '@/lib/utils'
import type { StatusColor } from '@/lib/types/app'

const colorMap: Record<StatusColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
}

export function StatusDot({ color, className }: { color: StatusColor; className?: string }) {
  return (
    <span className={cn('inline-block h-3 w-3 rounded-full', colorMap[color], className)} />
  )
}

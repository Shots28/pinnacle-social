import { Badge } from '@/components/ui/badge'

interface DimensionBadgeProps {
  name: string
  color: string
}

export function DimensionBadge({ name, color }: DimensionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium"
      style={{ borderColor: color, color }}
    >
      {name}
    </Badge>
  )
}

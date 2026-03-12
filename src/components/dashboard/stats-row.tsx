import { Card, CardContent } from '@/components/ui/card'
import { Users, AlertCircle, HandshakeIcon, CalendarCheck } from 'lucide-react'
import type { DashboardStats } from '@/lib/types/app'

interface StatsRowProps {
  stats: DashboardStats
}

const statCards: {
  key: keyof Pick<DashboardStats, 'total_people' | 'overdue_checkins' | 'pending_commitments' | 'todays_follow_ups'>
  label: string
  icon: typeof Users
  colorClass: string
  bgClass: string
  isAlert: boolean
}[] = [
  {
    key: 'total_people',
    label: 'Total People',
    icon: Users,
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50 dark:bg-teal-950/30',
    isAlert: false,
  },
  {
    key: 'overdue_checkins',
    label: 'Overdue Check-ins',
    icon: AlertCircle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    isAlert: true,
  },
  {
    key: 'pending_commitments',
    label: 'Pending Commitments',
    icon: HandshakeIcon,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    isAlert: false,
  },
  {
    key: 'todays_follow_ups',
    label: "Today's Follow-ups",
    icon: CalendarCheck,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    isAlert: false,
  },
]

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        return (
          <Card key={card.key} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bgClass}`}>
                <Icon className={`h-5 w-5 ${card.colorClass}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-2xl font-bold ${card.isAlert && value > 0 ? 'text-red-600' : ''}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground truncate">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

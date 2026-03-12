import { Sparkles, Trophy, Heart } from 'lucide-react'
import type { DashboardStats } from '@/lib/types/app'

interface EmotionalPayoffProps {
  stats: DashboardStats
}

export function EmotionalPayoff({ stats }: EmotionalPayoffProps) {
  const message = getMessage(stats)

  return (
    <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100/50 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 shadow-inner">
          <message.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-teal-900">{message.text}</p>
          {message.subtext && (
            <p className="text-sm font-medium text-teal-700/80 mt-1">{message.subtext}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function getMessage(stats: DashboardStats) {
  const { weekly_interactions, overdue_checkins, recent_milestones } = stats

  if (recent_milestones.length > 0) {
    return {
      icon: Trophy,
      text: `${recent_milestones.length} milestone${recent_milestones.length === 1 ? '' : 's'} hit recently!`,
      subtext: 'Celebrating progress with the people you care about.',
    }
  }

  if (overdue_checkins === 0 && weekly_interactions > 0) {
    return {
      icon: Sparkles,
      text: '0 overdue check-ins — you\'re on top of things!',
      subtext: `You've logged ${weekly_interactions} interaction${weekly_interactions === 1 ? '' : 's'} this week.`,
    }
  }

  if (weekly_interactions > 0) {
    return {
      icon: Heart,
      text: `You connected with ${weekly_interactions} people this week — keep it up!`,
      subtext: null,
    }
  }

  return {
    icon: Heart,
    text: 'Every connection matters. Start by reaching out to someone today.',
    subtext: null,
  }
}

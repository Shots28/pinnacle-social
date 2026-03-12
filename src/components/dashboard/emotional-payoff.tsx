import { Sparkles, Trophy, Heart } from 'lucide-react'
import type { DashboardStats } from '@/lib/types/app'

interface EmotionalPayoffProps {
  stats: DashboardStats
}

export function EmotionalPayoff({ stats }: EmotionalPayoffProps) {
  const message = getMessage(stats)

  return (
    <div className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <message.icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold">{message.text}</p>
          {message.subtext && (
            <p className="text-sm text-teal-100 mt-0.5">{message.subtext}</p>
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

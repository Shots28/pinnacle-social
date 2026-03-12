export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return 'Never'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Today'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function isOverdue(lastContactAt: string | null, rhythmDays: number | null): boolean {
  if (!rhythmDays) return false
  if (!lastContactAt) return true
  const now = new Date()
  const lastContact = new Date(lastContactAt)
  const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > rhythmDays
}

export function daysOverdue(lastContactAt: string | null, rhythmDays: number | null): number {
  if (!rhythmDays) return 0
  if (!lastContactAt) return rhythmDays
  const now = new Date()
  const lastContact = new Date(lastContactAt)
  const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays - rhythmDays)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export const RELATIONSHIP_TYPES = [
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'mentee', label: 'Mentee' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
] as const

export const STATUS_COLORS = [
  { value: 'green', label: 'Great', color: '#22c55e' },
  { value: 'yellow', label: 'Needs Attention', color: '#eab308' },
  { value: 'red', label: 'Urgent', color: '#ef4444' },
  { value: 'blue', label: 'New', color: '#3b82f6' },
] as const

export const INTERACTION_TYPES = [
  { value: 'conversation', label: 'Conversation', icon: 'message-circle' },
  { value: 'activity', label: 'Activity', icon: 'activity' },
  { value: 'check_in', label: 'Check-in', icon: 'check-circle' },
  { value: 'call', label: 'Call', icon: 'phone' },
  { value: 'text', label: 'Text', icon: 'message-square' },
  { value: 'visit', label: 'Visit', icon: 'map-pin' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' },
] as const

export const CONTACT_RHYTHM_OPTIONS = [
  { value: 1, label: 'Daily' },
  { value: 3, label: 'Every 3 days' },
  { value: 7, label: 'Weekly' },
  { value: 14, label: 'Every 2 weeks' },
  { value: 30, label: 'Monthly' },
  { value: 90, label: 'Quarterly' },
] as const

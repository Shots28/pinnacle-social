import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Household = Database['public']['Tables']['households']['Row']
export type Person = Database['public']['Tables']['people']['Row']
export type LifeDimension = Database['public']['Tables']['life_dimensions']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type Interaction = Database['public']['Tables']['interactions']['Row']
export type Commitment = Database['public']['Tables']['commitments']['Row']
export type FollowUp = Database['public']['Tables']['follow_ups']['Row']
export type WeeklyPlan = Database['public']['Tables']['weekly_plans']['Row']

// Insert types
export type PersonInsert = Database['public']['Tables']['people']['Insert']
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type MilestoneInsert = Database['public']['Tables']['milestones']['Insert']
export type CommitmentInsert = Database['public']['Tables']['commitments']['Insert']
export type FollowUpInsert = Database['public']['Tables']['follow_ups']['Insert']

// Enums
export type RelationshipType = 'child' | 'friend' | 'family' | 'mentee' | 'colleague' | 'other'
export type StatusColor = 'green' | 'yellow' | 'red' | 'blue'
export type PersonStatus = 'active' | 'inactive' | 'archived'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned'
export type CommitmentStatus = 'pending' | 'completed' | 'overdue' | 'cancelled'
export type InteractionType = 'conversation' | 'activity' | 'check_in' | 'call' | 'text' | 'visit' | 'other'
export type CommittedBy = 'me' | 'them'

// Dashboard stats
export type DashboardStats = {
  total_people: number
  overdue_checkins: number
  pending_commitments: number
  todays_follow_ups: number
  weekly_interactions: number
  recent_milestones: {
    id: string
    title: string
    completed_at: string
    goal_title: string
    person_name: string
  }[]
}

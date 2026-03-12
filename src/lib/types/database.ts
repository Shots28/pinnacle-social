export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          onboarding_completed: boolean
          weekly_planning_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          weekly_planning_day?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          weekly_planning_day?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      households: {
        Row: {
          id: string
          user_id: string
          name: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'households_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      people: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          first_name: string
          last_name: string | null
          avatar_url: string | null
          relationship_type: 'child' | 'friend' | 'family' | 'mentee' | 'colleague' | 'other'
          status: 'active' | 'inactive' | 'archived'
          status_color: 'green' | 'yellow' | 'red' | 'blue'
          phone: string | null
          email: string | null
          birthday: string | null
          contact_rhythm_days: number | null
          last_contact_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          first_name: string
          last_name?: string | null
          avatar_url?: string | null
          relationship_type: 'child' | 'friend' | 'family' | 'mentee' | 'colleague' | 'other'
          status?: 'active' | 'inactive' | 'archived'
          status_color?: 'green' | 'yellow' | 'red' | 'blue'
          phone?: string | null
          email?: string | null
          birthday?: string | null
          contact_rhythm_days?: number | null
          last_contact_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          first_name?: string
          last_name?: string | null
          avatar_url?: string | null
          relationship_type?: 'child' | 'friend' | 'family' | 'mentee' | 'colleague' | 'other'
          status?: 'active' | 'inactive' | 'archived'
          status_color?: 'green' | 'yellow' | 'red' | 'blue'
          phone?: string | null
          email?: string | null
          birthday?: string | null
          contact_rhythm_days?: number | null
          last_contact_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'people_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'people_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          },
        ]
      }
      life_dimensions: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          color: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          color?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          color?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'life_dimensions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          person_id: string
          dimension_id: string | null
          title: string
          description: string | null
          status: 'active' | 'completed' | 'paused' | 'abandoned'
          target_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          dimension_id?: string | null
          title: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused' | 'abandoned'
          target_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          dimension_id?: string | null
          title?: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused' | 'abandoned'
          target_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'goals_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_dimension_id_fkey'
            columns: ['dimension_id']
            isOneToOne: false
            referencedRelation: 'life_dimensions'
            referencedColumns: ['id']
          },
        ]
      }
      milestones: {
        Row: {
          id: string
          goal_id: string
          title: string
          description: string | null
          sort_order: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          description?: string | null
          sort_order?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          description?: string | null
          sort_order?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'milestones_goal_id_fkey'
            columns: ['goal_id']
            isOneToOne: false
            referencedRelation: 'goals'
            referencedColumns: ['id']
          },
        ]
      }
      interactions: {
        Row: {
          id: string
          user_id: string
          person_id: string
          type: 'conversation' | 'activity' | 'check_in' | 'call' | 'text' | 'visit' | 'other'
          title: string | null
          notes: string | null
          occurred_at: string
          dimension_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          type: 'conversation' | 'activity' | 'check_in' | 'call' | 'text' | 'visit' | 'other'
          title?: string | null
          notes?: string | null
          occurred_at?: string
          dimension_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          type?: 'conversation' | 'activity' | 'check_in' | 'call' | 'text' | 'visit' | 'other'
          title?: string | null
          notes?: string | null
          occurred_at?: string
          dimension_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'interactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interactions_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interactions_dimension_id_fkey'
            columns: ['dimension_id']
            isOneToOne: false
            referencedRelation: 'life_dimensions'
            referencedColumns: ['id']
          },
        ]
      }
      commitments: {
        Row: {
          id: string
          user_id: string
          person_id: string
          interaction_id: string | null
          title: string
          description: string | null
          committed_by: 'me' | 'them'
          due_date: string | null
          status: 'pending' | 'completed' | 'overdue' | 'cancelled'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          interaction_id?: string | null
          title: string
          description?: string | null
          committed_by: 'me' | 'them'
          due_date?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'cancelled'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          interaction_id?: string | null
          title?: string
          description?: string | null
          committed_by?: 'me' | 'them'
          due_date?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'cancelled'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'commitments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commitments_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commitments_interaction_id_fkey'
            columns: ['interaction_id']
            isOneToOne: false
            referencedRelation: 'interactions'
            referencedColumns: ['id']
          },
        ]
      }
      follow_ups: {
        Row: {
          id: string
          user_id: string
          person_id: string
          title: string
          notes: string | null
          scheduled_at: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_id: string
          title: string
          notes?: string | null
          scheduled_at: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_id?: string
          title?: string
          notes?: string | null
          scheduled_at?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follow_ups_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_ups_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          },
        ]
      }
      weekly_plans: {
        Row: {
          id: string
          user_id: string
          week_start: string
          reflections: string | null
          priorities: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          reflections?: string | null
          priorities?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          reflections?: string | null
          priorities?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_plans_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

'use client'

import { useState } from 'react'
import { CheckCircle2, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'
import type { Commitment, CommitmentStatus, Person } from '@/lib/types/app'

interface CommitmentCardProps {
  commitment: Commitment & {
    people?: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
  }
  showPerson?: boolean
  onStatusChange?: () => void
}

const statusConfig: Record<CommitmentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export function CommitmentCard({ commitment, showPerson = false, onStatusChange }: CommitmentCardProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const status = statusConfig[commitment.status]

  async function markComplete() {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('commitments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', commitment.id)

      if (error) throw error
      toast.success('Commitment completed!', {
        action: {
          label: 'Undo',
          onClick: async () => {
            await supabase
              .from('commitments')
              .update({ status: 'pending', completed_at: null })
              .eq('id', commitment.id)
            onStatusChange?.()
          },
        },
      })
      onStatusChange?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete commitment')
    } finally {
      setLoading(false)
    }
  }

  const personName = commitment.people
    ? `${commitment.people.first_name}${commitment.people.last_name ? ` ${commitment.people.last_name}` : ''}`
    : null

  return (
    <div className={cn(
      "group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all hover:shadow-sm",
      commitment.status === 'completed' && "opacity-60 bg-muted/30"
    )}>
      <div className="flex-shrink-0 pt-0.5">
        <Button
          variant="outline"
          size="icon"
          onClick={markComplete}
          disabled={loading || commitment.status !== 'pending'}
          className={cn(
            "h-8 w-8 rounded-full border-2 transition-colors",
            commitment.status === 'completed' 
              ? "bg-teal-500 border-teal-600 text-white" 
              : "border-muted-foreground/30 text-transparent hover:border-teal-400 hover:text-teal-600",
            commitment.status === 'overdue' && "border-red-400"
          )}
        >
          <CheckCircle2 className="size-4" />
        </Button>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className={cn("text-sm font-semibold truncate", commitment.status === 'completed' && "line-through text-muted-foreground")}>
            {commitment.title}
          </h3>
          {commitment.status === 'overdue' && (
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-red-600 border-red-200 bg-red-50 px-2 py-0">
              Overdue
            </Badge>
          )}
        </div>
        
        {commitment.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {commitment.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
          {showPerson && personName && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-foreground/80">
              <User className="size-3" />
              {personName}
            </span>
          )}
          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
            {commitment.committed_by === 'me' ? 'By me' : 'By them'}
          </span>
          {commitment.due_date && (
            <span className={cn("flex items-center gap-1", commitment.status === 'overdue' && "text-red-500")}>
              <Calendar className="size-3" />
              {formatDate(commitment.due_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

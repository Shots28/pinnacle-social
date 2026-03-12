'use client'

import { useState } from 'react'
import { CheckCircle2, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/dates'
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
      toast.success('Commitment completed!')
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
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{commitment.title}</h3>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {showPerson && personName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {personName}
                </span>
              )}
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {commitment.committed_by === 'me' ? 'By me' : 'By them'}
              </Badge>
              {commitment.due_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(commitment.due_date)}
                </span>
              )}
            </div>
            {commitment.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {commitment.description}
              </p>
            )}
          </div>

          {commitment.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={markComplete}
              disabled={loading}
              className="shrink-0 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

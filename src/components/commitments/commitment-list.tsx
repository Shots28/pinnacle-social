'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CommitmentCard } from '@/components/commitments/commitment-card'
import type { Commitment, Person } from '@/lib/types/app'

type CommitmentWithPerson = Commitment & {
  people?: Pick<Person, 'id' | 'first_name' | 'last_name'> | null
}

interface CommitmentListProps {
  commitments: CommitmentWithPerson[]
  showPerson?: boolean
}

export function CommitmentList({ commitments, showPerson = false }: CommitmentListProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'me' | 'them'>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return commitments
    return commitments.filter((c) => c.committed_by === filter)
  }, [commitments, filter])

  const pending = filtered.filter((c) => c.status === 'pending')
  const completed = filtered.filter((c) => c.status === 'completed')
  const overdue = filtered.filter((c) => c.status === 'overdue')

  function handleStatusChange() {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Committed-by filter */}
      <div className="flex gap-2">
        {(['all', 'me', 'them'] as const).map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? 'bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600'
                : ''
            }
          >
            {value === 'all' ? 'All' : value === 'me' ? 'By me' : 'By them'}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdue.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4 mt-4">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending commitments
              </p>
            ) : (
              pending.map((c) => (
                <CommitmentCard
                  key={c.id}
                  commitment={c}
                  showPerson={showPerson}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="space-y-4 mt-4">
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No overdue commitments
              </p>
            ) : (
              overdue.map((c) => (
                <CommitmentCard
                  key={c.id}
                  commitment={c}
                  showPerson={showPerson}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4 mt-4">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed commitments yet
              </p>
            ) : (
              completed.map((c) => (
                <CommitmentCard
                  key={c.id}
                  commitment={c}
                  showPerson={showPerson}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

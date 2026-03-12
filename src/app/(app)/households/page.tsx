'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Household } from '@/lib/types/app'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Home, Plus, Users, Loader2 } from 'lucide-react'

interface HouseholdWithCount extends Household {
  member_count: number
}

export default function HouseholdsPage() {
  const supabase = createClient()

  const [households, setHouseholds] = useState<HouseholdWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadHouseholds()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadHouseholds() {
    setLoading(true)
    const { data } = await supabase
      .from('households')
      .select('*, people(count)')
      .order('name')

    if (data) {
      const mapped = data.map((h) => ({
        ...h,
        member_count: (h.people as unknown as { count: number }[])?.[0]?.count ?? 0,
      }))
      setHouseholds(mapped)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Household name is required')
      return
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase.from('households').insert({
        user_id: user.id,
        name: name.trim(),
        notes: notes.trim() || null,
      })

      if (error) throw error
      toast.success('Household created')
      setName('')
      setNotes('')
      setDialogOpen(false)
      loadHouseholds()
    } catch {
      toast.error('Failed to create household')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Households"
        description="Group people by household"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="mr-2 size-4" />
                Create Household
              </Button>
            } />
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Household</DialogTitle>
                  <DialogDescription>
                    Create a new household to group people together.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 my-4">
                  <div className="space-y-2">
                    <label htmlFor="household-name" className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="household-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., The Johnsons"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="household-notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <Textarea
                      id="household-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating} className="bg-teal-600 hover:bg-teal-700">
                    {creating && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm">
              <CardContent>
                <div className="h-12 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : households.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No households yet"
          description="Create a household to group people together."
          actionLabel="Create Household"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-3">
          {households.map((household) => (
            <Link key={household.id} href={`/households/${household.id}`}>
              <Card size="sm" className="transition-colors hover:bg-accent/50 cursor-pointer">
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <Home className="size-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{household.name}</p>
                    {household.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{household.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>{household.member_count}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

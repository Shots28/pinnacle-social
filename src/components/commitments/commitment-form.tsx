'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Person, CommittedBy } from '@/lib/types/app'

interface CommitmentFormProps {
  personId?: string
  interactionId?: string
  people?: Pick<Person, 'id' | 'first_name' | 'last_name'>[]
  onSuccess?: () => void
}

export function CommitmentForm({ personId, interactionId, people, onSuccess }: CommitmentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState(personId ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [committedBy, setCommittedBy] = useState<CommittedBy>('me')
  const [dueDate, setDueDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!selectedPersonId) {
      toast.error('Please select a person')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('commitments').insert({
        user_id: user.id,
        person_id: selectedPersonId,
        interaction_id: interactionId ?? null,
        title: title.trim(),
        description: description.trim() || null,
        committed_by: committedBy,
        due_date: dueDate || null,
      })

      if (error) throw error

      toast.success('Commitment created')
      if (onSuccess) {
        onSuccess()
      } else if (personId) {
        router.push(`/people/${personId}`)
      } else {
        router.push('/commitments')
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!personId && people && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Person <span className="text-red-500">*</span>
          </label>
          <Select value={selectedPersonId} onValueChange={(v) => v !== null && setSelectedPersonId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a person">
                {selectedPersonId
                  ? (() => { const pp = people?.find((p) => p.id === selectedPersonId); return pp ? `${pp.first_name}${pp.last_name ? ` ${pp.last_name}` : ''}` : 'Select a person' })()
                  : 'Select a person'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {people.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name}{p.last_name ? ` ${p.last_name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="commitment-title" className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="commitment-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Send them the article"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="commitment-description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="commitment-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Committed by</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCommittedBy('me')}
            className={cn(
              committedBy === 'me' && 'bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600'
            )}
          >
            By me
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCommittedBy('them')}
            className={cn(
              committedBy === 'them' && 'bg-teal-600 text-white hover:bg-teal-700 hover:text-white border-teal-600'
            )}
          >
            By them
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="commitment-due-date" className="text-sm font-medium">
          Due Date
        </label>
        <Input
          id="commitment-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {loading ? 'Saving...' : 'Create Commitment'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

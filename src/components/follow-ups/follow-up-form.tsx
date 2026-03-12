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
import type { Person } from '@/lib/types/app'

interface FollowUpFormProps {
  personId?: string
  people?: Pick<Person, 'id' | 'first_name' | 'last_name'>[]
  onSuccess?: () => void
}

export function FollowUpForm({ personId, people, onSuccess }: FollowUpFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState(personId ?? '')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

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
    if (!scheduledAt) {
      toast.error('Please set a date and time')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('follow_ups').insert({
        user_id: user.id,
        person_id: selectedPersonId,
        title: title.trim(),
        notes: notes.trim() || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
      })

      if (error) throw error

      toast.success('Follow-up scheduled')
      if (onSuccess) {
        onSuccess()
      } else if (personId) {
        router.push(`/people/${personId}`)
      } else {
        router.push('/follow-ups')
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
        <label htmlFor="followup-title" className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="followup-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Check in about job interview"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="followup-notes" className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id="followup-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any context or reminders..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="followup-scheduled" className="text-sm font-medium">
          Scheduled at <span className="text-red-500">*</span>
        </label>
        <Input
          id="followup-scheduled"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {loading ? 'Saving...' : 'Schedule Follow-up'}
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'
import { INTERACTION_TYPES } from '@/lib/utils/constants'
import type { InteractionType } from '@/lib/types/app'
import { toast } from 'sonner'
import {
  MessageCircle,
  Activity,
  CheckCircle,
  Phone,
  MessageSquare,
  MapPin,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'message-circle': MessageCircle,
  'activity': Activity,
  'check-circle': CheckCircle,
  'phone': Phone,
  'message-square': MessageSquare,
  'map-pin': MapPin,
  'more-horizontal': MoreHorizontal,
}

interface InteractionFormProps {
  personId?: string
  people?: { id: string; first_name: string; last_name: string | null }[]
  onSuccess?: () => void
}

export function InteractionForm({ personId, people, onSuccess }: InteractionFormProps) {
  const router = useRouter()
  const [selectedPersonId, setSelectedPersonId] = useState(personId ?? '')
  const [type, setType] = useState<InteractionType>('conversation')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDateField, setShowDateField] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPersonId) {
      toast.error('Please select a person')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('interactions').insert({
      user_id: user.id,
      person_id: selectedPersonId,
      type,
      title: title || null,
      notes: notes || null,
      occurred_at: new Date(occurredAt).toISOString(),
    })

    if (error) {
      toast.error('Failed to log interaction')
      setIsSubmitting(false)
      return
    }

    // Update last_contact_at on the person
    await supabase
      .from('people')
      .update({ last_contact_at: new Date(occurredAt).toISOString() })
      .eq('id', selectedPersonId)

    toast.success('Interaction logged!')
    setIsSubmitting(false)

    if (onSuccess) {
      onSuccess()
    } else if (personId) {
      router.refresh()
      setTitle('')
      setNotes('')
      setType('conversation')
    } else {
      router.push('/interactions')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Person select - only show if no personId passed */}
      {!personId && people && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Person</label>
          <Select value={selectedPersonId} onValueChange={(v) => v !== null && setSelectedPersonId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a person..." />
            </SelectTrigger>
            <SelectContent>
              {people.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.first_name} {person.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Type button group */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Type</label>
        <div className="flex flex-wrap gap-1.5">
          {INTERACTION_TYPES.map((t) => {
            const Icon = iconMap[t.icon]
            const isActive = type === t.value
            return (
              <Button
                key={t.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={isActive ? 'bg-teal-600 hover:bg-teal-700' : ''}
                onClick={() => setType(t.value as InteractionType)}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {t.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Title <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="e.g., Coffee catch-up, Phone call about project..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          placeholder="Key takeaways, things to remember..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Date/time (collapsible) */}
      {!showDateField ? (
        <button
          type="button"
          className="text-sm text-teal-600 hover:underline"
          onClick={() => setShowDateField(true)}
        >
          Change date/time (defaults to now)
        </button>
      ) : (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">When</label>
          <Input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Log Interaction'
        )}
      </Button>
    </form>
  )
}

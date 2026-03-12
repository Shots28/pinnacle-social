'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonAvatar } from '@/components/people/person-avatar'
import { Separator } from '@/components/ui/separator'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Person, WeeklyPlan } from '@/lib/types/app'

interface Priority {
  person_id: string
  notes: string
}

interface PlanEditorProps {
  weekStart: string
  existingPlan?: WeeklyPlan | null
  suggestedPeople: Person[]
  allPeople: Person[]
}

export function PlanEditor({ weekStart, existingPlan, suggestedPeople, allPeople }: PlanEditorProps) {
  const supabase = createClient()

  const existingPriorities: Priority[] = Array.isArray(existingPlan?.priorities)
    ? (existingPlan.priorities as unknown as Priority[])
    : []

  const [reflections, setReflections] = useState(existingPlan?.reflections ?? '')
  const [priorities, setPriorities] = useState<Priority[]>(existingPriorities)
  const [saving, setSaving] = useState(false)

  const isSelected = useCallback(
    (personId: string) => priorities.some((p) => p.person_id === personId),
    [priorities]
  )

  const togglePerson = useCallback((personId: string) => {
    setPriorities((prev) => {
      if (prev.some((p) => p.person_id === personId)) {
        return prev.filter((p) => p.person_id !== personId)
      }
      return [...prev, { person_id: personId, notes: '' }]
    })
  }, [])

  const updateNote = useCallback((personId: string, notes: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.person_id === personId ? { ...p, notes } : p))
    )
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        user_id: user.id,
        week_start: weekStart,
        reflections: reflections || null,
        priorities: JSON.parse(JSON.stringify(priorities)),
        updated_at: new Date().toISOString(),
      }

      if (existingPlan) {
        const { error } = await supabase
          .from('weekly_plans')
          .update(payload)
          .eq('id', existingPlan.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('weekly_plans').insert(payload)
        if (error) throw error
      }

      toast.success('Weekly plan saved!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  // Combine suggested people first, then rest of allPeople not already in suggested
  const suggestedIds = new Set(suggestedPeople.map((p) => p.id))
  const otherPeople = allPeople.filter((p) => !suggestedIds.has(p.id))

  return (
    <div className="space-y-6">
      {/* Reflections */}
      <Card>
        <CardHeader>
          <CardTitle>Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How did last week go? What went well? What could improve?"
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
            className="min-h-24"
          />
        </CardContent>
      </Card>

      {/* Priority People */}
      <Card>
        <CardHeader>
          <CardTitle>Plan This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedPeople.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Suggested (due for a check-in)
              </p>
              {suggestedPeople.map((person) => (
                <PersonPriorityRow
                  key={person.id}
                  person={person}
                  selected={isSelected(person.id)}
                  note={priorities.find((p) => p.person_id === person.id)?.notes ?? ''}
                  onToggle={() => togglePerson(person.id)}
                  onNoteChange={(notes) => updateNote(person.id, notes)}
                />
              ))}
            </div>
          )}

          {otherPeople.length > 0 && suggestedPeople.length > 0 && (
            <Separator />
          )}

          {otherPeople.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Everyone Else</p>
              {otherPeople.map((person) => (
                <PersonPriorityRow
                  key={person.id}
                  person={person}
                  selected={isSelected(person.id)}
                  note={priorities.find((p) => p.person_id === person.id)?.notes ?? ''}
                  onToggle={() => togglePerson(person.id)}
                  onNoteChange={(notes) => updateNote(person.id, notes)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Plan'}
        </Button>
      </div>
    </div>
  )
}

function PersonPriorityRow({
  person,
  selected,
  note,
  onToggle,
  onNoteChange,
}: {
  person: Person
  selected: boolean
  note: string
  onToggle: () => void
  onNoteChange: (notes: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} />
        <PersonAvatar
          firstName={person.first_name}
          lastName={person.last_name}
          avatarUrl={person.avatar_url}
          statusColor={person.status_color}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {person.first_name} {person.last_name ?? ''}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {person.relationship_type}
          </p>
        </div>
      </div>
      {selected && (
        <div className="ml-10">
          <Input
            placeholder="Notes for this week..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  )
}

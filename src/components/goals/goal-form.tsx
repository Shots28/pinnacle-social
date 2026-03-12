'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
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
import type { Goal, LifeDimension } from '@/lib/types/app'

interface GoalFormProps {
  personId: string
  initialData?: Goal & { milestones?: { id: string; title: string; sort_order: number }[] }
  dimensions: LifeDimension[]
}

export function GoalForm({ personId, initialData, dimensions }: GoalFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [dimensionId, setDimensionId] = useState<string>(initialData?.dimension_id ?? '')
  const [targetDate, setTargetDate] = useState(initialData?.target_date ?? '')
  const [milestones, setMilestones] = useState<{ id?: string; title: string }[]>(
    initialData?.milestones?.map((m) => ({ id: m.id, title: m.title })) ?? [{ title: '' }]
  )

  function addMilestone() {
    setMilestones((prev) => [...prev, { title: '' }])
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMilestone(index: number, value: string) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, title: value } : m)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const goalData = {
        user_id: user.id,
        person_id: personId,
        title: title.trim(),
        description: description.trim() || null,
        dimension_id: dimensionId || null,
        target_date: targetDate || null,
      }

      let goalId: string

      if (initialData) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', initialData.id)
        if (error) throw error
        goalId = initialData.id

        // Delete removed milestones, then upsert
        const existingIds = milestones.filter((m) => m.id).map((m) => m.id!)
        if (initialData.milestones?.length) {
          const toDelete = initialData.milestones
            .filter((m) => !existingIds.includes(m.id))
            .map((m) => m.id)
          if (toDelete.length) {
            await supabase.from('milestones').delete().in('id', toDelete)
          }
        }
      } else {
        const { data, error } = await supabase
          .from('goals')
          .insert(goalData)
          .select('id')
          .single()
        if (error) throw error
        goalId = data.id
      }

      // Insert/update milestones
      const validMilestones = milestones.filter((m) => m.title.trim())
      if (validMilestones.length > 0) {
        const milestoneRows = validMilestones.map((m, index) => ({
          ...(m.id ? { id: m.id } : {}),
          goal_id: goalId,
          title: m.title.trim(),
          sort_order: index,
        }))

        const { error: mError } = await supabase.from('milestones').upsert(milestoneRows)
        if (mError) throw mError
      }

      toast.success(initialData ? 'Goal updated' : 'Goal created')
      router.push(`/people/${personId}/goals/${goalId}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Learn to ride a bike"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does achieving this goal look like?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Life Dimension</label>
        <Select value={dimensionId} onValueChange={(v) => v !== null && setDimensionId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a dimension" />
          </SelectTrigger>
          <SelectContent>
            {dimensions.map((dim) => (
              <SelectItem key={dim.id} value={dim.id}>
                {dim.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="target_date" className="text-sm font-medium">
          Target Date
        </label>
        <Input
          id="target_date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Milestones</label>
        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={milestone.title}
                onChange={(e) => updateMilestone(index, e.target.value)}
                placeholder={`Milestone ${index + 1}`}
                className="flex-1"
              />
              {milestones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMilestone}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add milestone
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
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

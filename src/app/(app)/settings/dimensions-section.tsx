'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { LifeDimension } from '@/lib/types/app'

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface DimensionsSectionProps {
  dimensions: LifeDimension[]
}

export function DimensionsSection({ dimensions: initialDimensions }: DimensionsSectionProps) {
  const supabase = createClient()
  const [dimensions, setDimensions] = useState(initialDimensions)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const updateDimension = (id: string, field: 'name' | 'color', value: string) => {
    setDimensions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    )
  }

  const moveDimension = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= dimensions.length) return
    const updated = [...dimensions]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setDimensions(updated.map((d, i) => ({ ...d, sort_order: i })))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const dim of dimensions) {
        const { error } = await supabase
          .from('life_dimensions')
          .update({
            name: dim.name,
            color: dim.color,
            sort_order: dim.sort_order,
          })
          .eq('id', dim.id)
        if (error) throw error
      }
      toast.success('Dimensions updated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update dimensions')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('life_dimensions')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          color: newColor,
          sort_order: dimensions.length,
        })
        .select()
        .single()

      if (error) throw error
      setDimensions((prev) => [...prev, data])
      setNewName('')
      setNewColor(COLOR_OPTIONS[0])
      toast.success('Dimension added!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add dimension')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('life_dimensions')
        .delete()
        .eq('id', deleteId)
      if (error) throw error
      setDimensions((prev) => prev.filter((d) => d.id !== deleteId))
      setDeleteId(null)
      toast.success('Dimension deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete dimension')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Life Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No dimensions yet. Add one to categorize your goals.
            </p>
          )}

          {dimensions.map((dim, index) => (
            <div key={dim.id} className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveDimension(index, -1)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveDimension(index, 1)}
                  disabled={index === dimensions.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div
                className="h-6 w-6 shrink-0 rounded-full border"
                style={{ backgroundColor: dim.color ?? '#3b82f6' }}
              />

              <Input
                value={dim.name}
                onChange={(e) => updateDimension(dim.id, 'name', e.target.value)}
                className="flex-1"
              />

              <div className="flex gap-1">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateDimension(dim.id, 'color', color)}
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      dim.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteId(dim.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Separator />

          {/* Add New Dimension */}
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 shrink-0 rounded-full border"
              style={{ backgroundColor: newColor }}
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New dimension name"
              className="flex-1"
            />
            <div className="flex gap-1">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    newColor === color
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:border-muted-foreground/50'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              disabled={!newName.trim() || adding}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>

          {dimensions.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dimension</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this dimension? Goals associated with it
              will not be deleted, but will lose their dimension assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

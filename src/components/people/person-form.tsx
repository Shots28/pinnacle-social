'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Person, Household } from '@/lib/types/app'
import { RELATIONSHIP_TYPES, STATUS_COLORS, CONTACT_RHYTHM_OPTIONS } from '@/lib/utils/constants'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface PersonFormProps {
  initialData?: Person
}

export function PersonForm({ initialData }: PersonFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!initialData

  const [loading, setLoading] = useState(false)
  const [households, setHouseholds] = useState<Household[]>([])

  const [firstName, setFirstName] = useState(initialData?.first_name ?? '')
  const [lastName, setLastName] = useState(initialData?.last_name ?? '')
  const [relationshipType, setRelationshipType] = useState(initialData?.relationship_type ?? 'friend')
  const [statusColor, setStatusColor] = useState(initialData?.status_color ?? 'blue')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [birthday, setBirthday] = useState(initialData?.birthday ?? '')
  const [contactRhythmDays, setContactRhythmDays] = useState<number | null>(
    initialData?.contact_rhythm_days ?? null
  )
  const [householdId, setHouseholdId] = useState<string | null>(initialData?.household_id ?? null)
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  useEffect(() => {
    async function loadHouseholds() {
      const { data } = await supabase
        .from('households')
        .select('*')
        .order('name')
      if (data) setHouseholds(data)
    }
    loadHouseholds()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!firstName.trim()) {
      toast.error('First name is required')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const personData = {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        relationship_type: relationshipType,
        status_color: statusColor,
        phone: phone.trim() || null,
        email: email.trim() || null,
        birthday: birthday || null,
        contact_rhythm_days: contactRhythmDays,
        household_id: householdId,
        notes: notes.trim() || null,
      } as const

      if (isEditing) {
        const { error } = await supabase
          .from('people')
          .update(personData)
          .eq('id', initialData.id)

        if (error) throw error
        toast.success('Person updated successfully')
        router.push(`/people/${initialData.id}`)
      } else {
        const { data, error } = await supabase
          .from('people')
          .insert({ ...personData, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        toast.success('Person added successfully')
        router.push(`/people/${data.id}`)
      }

      router.refresh()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update person' : 'Failed to add person')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship</label>
                <Select value={relationshipType} onValueChange={(val) => val !== null && setRelationshipType(val as typeof relationshipType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2">
                  {STATUS_COLORS.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => setStatusColor(sc.value as typeof statusColor)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        statusColor === sc.value
                          ? 'border-foreground/20 bg-accent'
                          : 'border-transparent hover:bg-accent/50'
                      )}
                    >
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: sc.color }}
                      />
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="birthday" className="text-sm font-medium">
                  Birthday
                </label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Rhythm</label>
                <Select
                  value={contactRhythmDays?.toString() ?? ''}
                  onValueChange={(val) =>
                    val !== null && setContactRhythmDays(val === '' ? null : Number(val))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No rhythm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No rhythm</SelectItem>
                    {CONTACT_RHYTHM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Household</label>
              <Select
                value={householdId ?? ''}
                onValueChange={(val) => val !== null && setHouseholdId(val === '' ? null : val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No household" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No household</SelectItem>
                  {households.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this person..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Person'}
          </Button>
        </div>
      </div>
    </form>
  )
}

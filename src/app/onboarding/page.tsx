'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RELATIONSHIP_TYPES, CONTACT_RHYTHM_OPTIONS } from '@/lib/utils/constants'
import { Sparkles, UserPlus, Clock, Rocket, Loader2 } from 'lucide-react'
import type { RelationshipType } from '@/lib/types/app'

const TOTAL_STEPS = 4

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  // Step 2 form state
  const [firstName, setFirstName] = useState('')
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('friend')
  const [contactRhythmDays, setContactRhythmDays] = useState<number | null>(null)
  const [createdPersonId, setCreatedPersonId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Step 3 state
  const [rhythmValue, setRhythmValue] = useState<number | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
        return
      }

      setUserName(profile?.full_name ?? 'there')
      setLoading(false)
    }

    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleAddPerson = async () => {
    if (!firstName.trim()) return
    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('people')
        .insert({
          user_id: user.id,
          first_name: firstName.trim(),
          relationship_type: relationshipType,
          contact_rhythm_days: contactRhythmDays,
        })
        .select('id')
        .single()

      if (error) throw error
      setCreatedPersonId(data.id)
      goNext()
    } catch (err) {
      console.error('Failed to create person:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetRhythm = async () => {
    if (!createdPersonId || !rhythmValue) {
      goNext()
      return
    }
    setSubmitting(true)
    try {
      await supabase
        .from('people')
        .update({ contact_rhythm_days: rhythmValue })
        .eq('id', createdPersonId)
      goNext()
    } catch (err) {
      console.error('Failed to set rhythm:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-6 pt-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/30">
                    <Sparkles className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Welcome to Pinnacle
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hi {userName}! Pinnacle helps you nurture and strengthen the
                      relationships that matter most. Let&apos;s get you set up in
                      just a few steps.
                    </p>
                  </div>
                  <Button
                    onClick={goNext}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="flex flex-col gap-6 pt-2">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30">
                      <UserPlus className="h-6 w-6 text-teal-600" />
                    </div>
                    <h2 className="text-lg font-semibold">Add Your First Person</h2>
                    <p className="text-sm text-muted-foreground">
                      Who is someone important in your life you want to stay connected with?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Relationship</label>
                      <Select
                        value={relationshipType}
                        onValueChange={(val) => val !== null && setRelationshipType(val as RelationshipType)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Contact Rhythm{' '}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Select
                        value={contactRhythmDays?.toString() ?? ''}
                        onValueChange={(val) =>
                          val !== null && setContactRhythmDays(val ? Number(val) : null)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="How often to check in" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_RHYTHM_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goBack} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleAddPerson}
                      disabled={!firstName.trim() || submitting}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add Person'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="flex flex-col gap-6 pt-2">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30">
                      <Clock className="h-6 w-6 text-teal-600" />
                    </div>
                    <h2 className="text-lg font-semibold">Set Your Rhythm</h2>
                    <p className="text-sm text-muted-foreground">
                      Contact rhythms help you stay in touch. Pinnacle will remind you
                      when it&apos;s time to reach out to{' '}
                      <span className="font-medium text-foreground">{firstName}</span>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">How often?</label>
                    <Select
                      value={rhythmValue?.toString() ?? ''}
                      onValueChange={(val) =>
                        val !== null && setRhythmValue(val ? Number(val) : null)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a rhythm" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_RHYTHM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goBack} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleSetRhythm}
                      disabled={submitting}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : rhythmValue ? (
                        'Set Rhythm'
                      ) : (
                        'Skip'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-6 pt-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/30">
                    <Rocket className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      You&apos;re All Set!
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You&apos;ve added <span className="font-medium text-foreground">{firstName}</span> to
                      your circle. You can add more people, set goals, log interactions,
                      and plan your weeks from the dashboard.
                    </p>
                  </div>
                  <Button
                    onClick={handleFinish}
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Go to Dashboard'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

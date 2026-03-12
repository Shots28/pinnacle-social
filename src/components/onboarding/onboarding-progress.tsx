'use client'

import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors duration-300',
            step <= currentStep
              ? 'bg-teal-600'
              : 'bg-muted-foreground/25'
          )}
        />
      ))}
    </div>
  )
}

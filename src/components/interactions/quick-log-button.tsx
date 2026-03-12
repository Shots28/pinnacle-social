'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { InteractionForm } from '@/components/interactions/interaction-form'
import { useState } from 'react'

interface QuickLogButtonProps {
  people: { id: string; first_name: string; last_name: string | null }[]
}

export function QuickLogButton({ people }: QuickLogButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="lg"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg md:bottom-6 md:right-6"
          />
        }
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Quick log interaction</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Log Interaction</SheetTitle>
          <SheetDescription>
            Quickly record a conversation, call, or activity.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <InteractionForm
            people={people}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

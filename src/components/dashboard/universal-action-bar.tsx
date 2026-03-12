'use client'

import { useState } from 'react'
import { Plus, MessageSquarePlus, UserPlus, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { InteractionForm } from '@/components/interactions/interaction-form'
import { CommitmentForm } from '@/components/commitments/commitment-form'
import { PersonForm } from '@/components/people/person-form'
import { cn } from '@/lib/utils'

interface UniversalActionBarProps {
  people: { id: string; first_name: string; last_name: string | null }[]
}

type ActionType = 'interaction' | 'person' | 'commitment' | null

export function UniversalActionBar({ people }: UniversalActionBarProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)

  const handleClose = () => setActiveAction(null)

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-zinc-900 shadow-xl border rounded-full px-2 py-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-teal-50 hover:text-teal-600 h-12 w-12"
          onClick={() => setActiveAction('interaction')}
          title="Log Interaction"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-teal-50 hover:text-teal-600 h-12 w-12"
          onClick={() => setActiveAction('commitment')}
          title="Add Commitment"
        >
          <CheckSquare className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-teal-50 hover:text-teal-600 h-12 w-12"
          onClick={() => setActiveAction('person')}
          title="Add Person"
        >
          <UserPlus className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={activeAction !== null} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl sm:max-w-xl mx-auto border-x sm:rounded-t-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {activeAction === 'interaction' && 'Log Interaction'}
              {activeAction === 'commitment' && 'New Commitment'}
              {activeAction === 'person' && 'Add Person'}
            </SheetTitle>
            <SheetDescription>
              {activeAction === 'interaction' && 'Quickly record a conversation, call, or meeting.'}
              {activeAction === 'commitment' && 'Make a promise to follow up on something.'}
              {activeAction === 'person' && 'Add someone new to your network.'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="pb-8">
            {activeAction === 'interaction' && (
              <InteractionForm people={people} onSuccess={handleClose} />
            )}
            {activeAction === 'commitment' && (
              <CommitmentForm people={people} onSuccess={handleClose} />
            )}
            {activeAction === 'person' && (
              <PersonForm onSuccess={handleClose} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

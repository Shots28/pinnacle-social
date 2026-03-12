'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarClock, Plus, Menu, MessageSquarePlus, UserPlus, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const quickActions = [
  { href: '/interactions/new', label: 'Log Interaction', description: 'Record a conversation, call, or meeting', icon: MessageSquarePlus },
  { href: '/people/new', label: 'Add Person', description: 'Add someone to your circle', icon: UserPlus },
  { href: '/follow-ups/new', label: 'Schedule Follow-up', description: 'Set a reminder to reach out', icon: CalendarClock },
  { href: '/commitments', label: 'Add Commitment', description: 'Track a promise made or received', icon: CheckSquare },
]

export function BottomNav({ pathname }: { pathname: string }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex items-center justify-around h-16 px-2">
          <NavTab href="/dashboard" label="Home" icon={LayoutDashboard} active={pathname.startsWith('/dashboard')} />
          <NavTab href="/people" label="People" icon={Users} active={pathname.startsWith('/people')} />

          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 min-w-[4rem]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
          </button>

          <NavTab href="/follow-ups" label="Follow-ups" icon={CalendarClock} active={pathname.startsWith('/follow-ups')} />
          <NavTab href="/settings" label="More" icon={Menu} active={pathname.startsWith('/settings')} />
        </div>
      </nav>

      <Sheet open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="mb-4">
            <SheetTitle>Quick Actions</SheetTitle>
            <SheetDescription>What would you like to do?</SheetDescription>
          </SheetHeader>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setShowQuickAdd(false)}
                className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function NavTab({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof LayoutDashboard; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg min-w-[4rem] transition-colors',
        active ? 'text-teal-600' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}

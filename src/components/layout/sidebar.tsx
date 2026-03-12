'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarClock, MessageCircle, CheckSquare, Settings, LogOut, Plus, MessageSquarePlus, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const coreItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/people', label: 'People', icon: Users },
  { href: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
]

const moreItems = [
  { href: '/interactions', label: 'Interactions', icon: MessageCircle },
  { href: '/commitments', label: 'Commitments', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const quickActions = [
  { href: '/interactions/new', label: 'Log Interaction', icon: MessageSquarePlus },
  { href: '/people/new', label: 'Add Person', icon: UserPlus },
  { href: '/follow-ups/new', label: 'Schedule Follow-up', icon: CalendarClock },
  { href: '/commitments/new', label: 'Add Commitment', icon: CheckSquare },
]

function NavLink({ item, pathname }: { item: typeof coreItems[number]; pathname: string }) {
  const isActive = pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-teal-50 text-teal-700'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  )
}

export function Sidebar({ pathname }: { pathname: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const quickAddRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setShowQuickAdd(false)
      }
    }
    if (showQuickAdd) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQuickAdd])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r bg-card z-40">
      <div className="flex items-center gap-2 px-6 h-16 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm">
          P
        </div>
        <span className="font-semibold text-lg">Pinnacle</span>
      </div>

      {/* Quick add button */}
      <div className="px-3 pt-5 pb-2 relative" ref={quickAddRef}>
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          <Plus className={cn("h-5 w-5 transition-transform", showQuickAdd && "rotate-45")} />
          Quick Add
        </button>
        {showQuickAdd && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-card border rounded-lg shadow-lg z-50 py-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setShowQuickAdd(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-1 pb-2">
        <div className="h-px bg-border" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {coreItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="pt-4 pb-2 px-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">More</span>
        </div>

        {moreItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

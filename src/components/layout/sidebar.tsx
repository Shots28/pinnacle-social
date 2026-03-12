'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, CalendarClock, MessageCircle, CheckSquare, CalendarDays, Settings, LogOut, MessageSquarePlus, UserPlus } from 'lucide-react'
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
  { href: '/weekly-plan', label: 'Weekly Plan', icon: CalendarDays },
  { href: '/settings', label: 'Settings', icon: Settings },
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

      {/* Quick actions */}
      <div className="px-3 pt-5 pb-2 space-y-1.5">
        <Link
          href="/interactions/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          <MessageSquarePlus className="h-5 w-5" />
          Log Interaction
        </Link>
        <div className="flex gap-1.5">
          <Link
            href="/people/new"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Person
          </Link>
          <Link
            href="/follow-ups/new"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/50"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Follow-up
          </Link>
        </div>
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

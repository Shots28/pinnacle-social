'use client'

import Link from 'next/link'
import { LayoutDashboard, Users, CalendarClock, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/people', label: 'People', icon: Users },
  { href: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { href: '/settings', label: 'More', icon: Menu },
]

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg min-w-[4rem] transition-colors',
                isActive ? 'text-teal-600' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

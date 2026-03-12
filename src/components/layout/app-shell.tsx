'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from './top-nav'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <Sidebar pathname={pathname} />

      {/* Main content — offset for sidebar on desktop, bottom nav on mobile */}
      <main className="flex-1 w-full relative md:ml-64 pb-20 md:pb-0">
        <div className="px-4 py-6 sm:px-6 md:px-10 md:py-8 max-w-4xl">
          {children}
        </div>
      </main>

      <BottomNav pathname={pathname} />
    </div>
  )
}

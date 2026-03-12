'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar pathname={pathname} />

      {/* Main content */}
      <main className="md:ml-64 pb-24 md:pb-8 min-h-screen">
        <div className="px-4 pt-6 pb-2 sm:px-6 md:px-8 md:pt-8 max-w-5xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav pathname={pathname} />
    </div>
  )
}

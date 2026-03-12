'use client'

import { TopNav } from './top-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />

      {/* Main content */}
      <main className="flex-1 w-full relative">
        <div className="container mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}

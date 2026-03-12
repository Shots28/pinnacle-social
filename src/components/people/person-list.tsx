'use client'

import { useState, useMemo } from 'react'
import type { Person, RelationshipType } from '@/lib/types/app'
import { PersonCard } from '@/components/people/person-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Users } from 'lucide-react'

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'mentee', label: 'Mentee' },
  { value: 'colleague', label: 'Colleague' },
]

interface PersonListProps {
  people: Person[]
}

export function PersonList({ people }: PersonListProps) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() => {
    let result = people

    if (activeTab !== 'all') {
      result = result.filter((p) => p.relationship_type === activeTab as RelationshipType)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.first_name.toLowerCase().includes(q) ||
          (p.last_name?.toLowerCase().includes(q) ?? false)
      )
    }

    return result
  }, [people, activeTab, search])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v !== null && setActiveTab(v)}>
        <TabsList>
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {FILTER_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No people found"
                description={
                  search.trim()
                    ? 'Try adjusting your search terms.'
                    : 'Add your first person to get started.'
                }
                actionLabel={!search.trim() ? 'Add Person' : undefined}
                actionHref={!search.trim() ? '/people/new' : undefined}
              />
            ) : (
              <div className="grid gap-2">
                {filtered.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

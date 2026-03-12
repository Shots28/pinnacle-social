import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileSection } from './profile-section'
import { DimensionsSection } from './dimensions-section'
import { PreferencesSection } from './preferences-section'
import { AccountSection } from './account-section'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: dimensions } = await supabase
    .from('life_dimensions')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  if (!profile) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile and preferences." />

      <div className="space-y-8">
        <ProfileSection profile={profile} />
        <DimensionsSection dimensions={dimensions ?? []} />
        <PreferencesSection profile={profile} />
        <AccountSection />
      </div>
    </div>
  )
}

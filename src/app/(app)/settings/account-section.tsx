'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LogOut, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AccountSection() {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error(err)
      toast.error('Failed to sign out')
      setSigningOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return
    setDeleting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Delete profile (cascade should handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">
                Sign out of your account on this device.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>

          <Separator />

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Danger Zone</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, including all your people,
              interactions, goals, and plans. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete My Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

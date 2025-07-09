'use client'

import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const { isSignedIn, signOut } = useAuth()

  if (!isSignedIn) return null

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' }) // Redirect to home after sign out
  }

  return (
    <Button onClick={handleSignOut} variant='outline' size='sm'>
      <LogOut className='mr-2 h-4 w-4' />
      Sign Out
    </Button>
  )
}

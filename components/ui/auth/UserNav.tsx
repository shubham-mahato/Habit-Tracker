// src/components/auth/UserNav.tsx
'use client' // This needs to be a Client Component

import React from 'react'
import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs' // Clerk hooks

// ShadCN UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton' // For loading state
import { LayoutDashboard, LogOut } from 'lucide-react' // Optional icons

export function UserNav() {
  // Get user and auth status from Clerk hooks
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useAuth()

  // Handle loading state
  if (!isLoaded) {
    // Display a skeleton loader while Clerk is initializing
    return <Skeleton className='h-10 w-10 rounded-full' />
  }

  // If user is signed in, display dropdown menu with user info
  if (isSignedIn) {
    // Extract user details for display
    const userInitials =
      `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` ||
      user?.emailAddresses[0]?.emailAddress[0] ||
      'U'
    const userFullName =
      `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
      user?.emailAddresses[0]?.emailAddress
    const userEmail = user?.emailAddresses[0]?.emailAddress

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Use ShadCN Avatar as the trigger */}
          <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src={user?.imageUrl}
                alt={userFullName || 'User avatar'}
              />
              <AvatarFallback>{userInitials.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          {/* Display user name and email */}
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>{userFullName}</p>
              <p className='text-muted-foreground text-xs leading-none'>
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Link to Dashboard */}
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Link href='/dashboard'>
              <LayoutDashboard className='mr-2 h-4 w-4' />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Sign Out Button */}
          <DropdownMenuItem
            onClick={() => signOut({ redirectUrl: '/' })} // Call Clerk's signOut
            className='cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700'
          >
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // If user is not signed in, display a Sign In button
  return (
    <Button asChild>
      <Link href='/sign-in'>Sign In</Link>
    </Button>
  )
}

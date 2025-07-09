// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'
import React from 'react'

// This component renders Clerk's pre-built Sign-In UI.
// Clerk handles all the logic, form fields, error handling, and multi-step flows.
export default function SignInPage() {
  return (
    <div className='bg-muted/40 flex min-h-screen items-center justify-center'>
      {/* Container to center the Sign-In component */}
      <SignIn
        path='/sign-in' // Tells Clerk the base path for the sign-in flow
        // Optional: Customize appearance to match your theme
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-primary text-primary-foreground hover:bg-primary/90',
            card: 'shadow-md',
            headerTitle: 'text-2xl font-semibold',
            headerSubtitle: 'text-muted-foreground',
          },
        }}
      />
    </div>
  )
}

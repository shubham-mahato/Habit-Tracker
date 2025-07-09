// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'
import React from 'react'

// This component renders Clerk's pre-built Sign-Up UI.
// Clerk handles fields, validation, verification steps, and social provider options.
export default function SignUpPage() {
  return (
    <div className='bg-muted/40 flex min-h-screen items-center justify-center'>
      {/* Container to center the Sign-Up component */}
      <SignUp
        path='/sign-up' // Tells Clerk the base path for the sign-up flow
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

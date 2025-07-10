// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { UserNav } from '@/components/ui/auth/UserNav'
import { Toaster } from '@/components/ui/sonner' // Import the Toaster component

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your personal habits and build better routines',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={inter.className}>
          {/* Header with Navigation */}
          <header className='border-b'>
            <div className='container mx-auto flex items-center justify-between px-4 py-4'>
              <h1 className='text-xl font-bold'>Habit Tracker</h1>
              <UserNav />
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>

          {/* Toast Notifications */}
          <Toaster richColors position='top-right' />
        </body>
      </html>
    </ClerkProvider>
  )
}

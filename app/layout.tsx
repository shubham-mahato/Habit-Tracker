// src/app/layout.tsx (Example Placement)
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { UserNav } from '@/components/ui/auth/UserNav'
// Import UserNav
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your personal habits',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Example Header Structure */}
          <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
            <div className='container flex h-14 items-center'>
              <div className='mr-4 hidden md:flex'>
                <Link href='/' className='mr-6 flex items-center space-x-2'>
                  {/* <YourLogo /> */}
                  <span className='font-bold sm:inline-block'>
                    Habit Tracker
                  </span>
                </Link>
                {/* <nav>...</nav> */}
              </div>
              <div className='flex flex-1 items-center justify-end space-x-4'>
                {/* Place UserNav here */}
                <UserNav />
              </div>
            </div>
          </header>
          <main className='flex-1'>{children}</main>
          {/* Optional Footer */}
        </body>
      </html>
    </ClerkProvider>
  )
}

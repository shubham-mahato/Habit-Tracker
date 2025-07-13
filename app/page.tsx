// app/page.tsx - Landing Page with Auth Handling

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CheckCircle,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Flame,
  Trophy,
  ArrowRight,
  Zap,
  Users,
  Shield,
} from 'lucide-react'

export default async function LandingPage() {
  // Check if user is authenticated
  const { userId } = await auth()

  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Header */}
      <header className='container mx-auto px-4 py-4 sm:px-6 lg:px-8'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
              <Target className='text-primary-foreground h-5 w-5' />
            </div>
            <span className='text-xl font-bold'>HabitTracker</span>
          </div>
          {/* Only show auth buttons for non-authenticated users */}
          <div className='flex items-center gap-4'>
            <Link href='/sign-in'>
              <Button variant='ghost' className='hidden sm:inline-flex'>
                Sign In
              </Button>
            </Link>
            <Link href='/sign-up'>
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className='container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
              Build Better Habits,
              <span className='text-primary'> Track Your Progress</span>
            </h1>
            <p className='text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl'>
              Transform your daily routines with our simple yet powerful habit
              tracking platform. Monitor streaks, analyze progress, and achieve
              your goals one day at a time.
            </p>
            <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link href='/sign-up'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Start Tracking Free
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </Link>
              <Link href='/sign-in'>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full sm:w-auto'
                >
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className='mt-12 lg:mt-16'>
            <div className='mx-auto max-w-4xl'>
              <div className='relative rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-gray-900/10'>
                <div className='rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white'>
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    <div className='rounded-lg bg-white/10 p-4 backdrop-blur'>
                      <CheckCircle className='h-8 w-8 text-green-400' />
                      <h3 className='mt-2 font-semibold'>Daily Tracking</h3>
                      <p className='text-sm opacity-90'>
                        Mark habits complete with a simple click
                      </p>
                    </div>
                    <div className='rounded-lg bg-white/10 p-4 backdrop-blur'>
                      <Flame className='h-8 w-8 text-orange-400' />
                      <h3 className='mt-2 font-semibold'>Streak Analytics</h3>
                      <p className='text-sm opacity-90'>
                        Track current and longest streaks
                      </p>
                    </div>
                    <div className='rounded-lg bg-white/10 p-4 backdrop-blur sm:col-span-2 lg:col-span-1'>
                      <BarChart3 className='h-8 w-8 text-blue-400' />
                      <h3 className='mt-2 font-semibold'>Progress Insights</h3>
                      <p className='text-sm opacity-90'>
                        Visual analytics and completion rates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='bg-white py-12 lg:py-20'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                Everything you need to succeed
              </h2>
              <p className='text-muted-foreground mx-auto mt-4 max-w-2xl text-lg'>
                Powerful features designed to help you build and maintain
                lasting habits
              </p>
            </div>

            <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
                    <Calendar className='h-6 w-6 text-blue-600' />
                  </div>
                  <CardTitle>Daily Check-ins</CardTitle>
                  <CardDescription>
                    Simple checkbox interface to mark habits complete each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      One-click completion
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Visual feedback
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Daily/Weekly frequencies
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100'>
                    <Flame className='h-6 w-6 text-orange-600' />
                  </div>
                  <CardTitle>Streak Tracking</CardTitle>
                  <CardDescription>
                    Monitor your consistency with current and longest streak
                    analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <Trophy className='h-4 w-4 text-yellow-500' />
                      Current active streaks
                    </li>
                    <li className='flex items-center gap-2'>
                      <Trophy className='h-4 w-4 text-yellow-500' />
                      Personal best records
                    </li>
                    <li className='flex items-center gap-2'>
                      <Trophy className='h-4 w-4 text-yellow-500' />
                      Motivation to continue
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100'>
                    <TrendingUp className='h-6 w-6 text-purple-600' />
                  </div>
                  <CardTitle>Progress Analytics</CardTitle>
                  <CardDescription>
                    Detailed insights with completion percentages and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <BarChart3 className='h-4 w-4 text-blue-500' />
                      7-day completion rates
                    </li>
                    <li className='flex items-center gap-2'>
                      <BarChart3 className='h-4 w-4 text-blue-500' />
                      Visual progress heatmaps
                    </li>
                    <li className='flex items-center gap-2'>
                      <BarChart3 className='h-4 w-4 text-blue-500' />
                      Performance insights
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
                    <Target className='h-6 w-6 text-green-600' />
                  </div>
                  <CardTitle>Categories & Organization</CardTitle>
                  <CardDescription>
                    Organize habits by categories like Health, Work, or Personal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Custom categories
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Easy filtering
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Better organization
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100'>
                    <Zap className='h-6 w-6 text-indigo-600' />
                  </div>
                  <CardTitle>Simple & Fast</CardTitle>
                  <CardDescription>
                    Clean interface designed for quick daily interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Minimal design
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Mobile responsive
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Lightning fast
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100'>
                    <Shield className='h-6 w-6 text-pink-600' />
                  </div>
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your habit data is secure and private, accessible only to
                    you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Secure authentication
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Private data
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      No data sharing
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='bg-primary py-12 lg:py-20'>
          <div className='container mx-auto px-4 text-center sm:px-6 lg:px-8'>
            <h2 className='text-primary-foreground text-3xl font-bold sm:text-4xl'>
              Ready to build better habits?
            </h2>
            <p className='text-primary-foreground/90 mx-auto mt-4 max-w-2xl text-lg'>
              Join thousands of users who are already transforming their lives
              through consistent habit tracking.
            </p>
            <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center'>
              <Link href='/sign-up'>
                <Button
                  size='lg'
                  variant='secondary'
                  className='w-full sm:w-auto'
                >
                  Start Your Journey Today
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 py-8'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary flex h-6 w-6 items-center justify-center rounded-lg'>
                <Target className='text-primary-foreground h-4 w-4' />
              </div>
              <span className='font-semibold'>HabitTracker</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              © 2025 HabitTracker. Build better habits.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

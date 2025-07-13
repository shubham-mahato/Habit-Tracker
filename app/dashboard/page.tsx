// app/dashboard/page.tsx - Updated with CategoryFilter and Responsive Design

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import DailyHabitView from '@/components/DailyHabitView'
import AddHabitForm from '@/components/AddHabitForm'
import CategoryManagement from '@/components/CategoryManagement'
import CategoryFilter from '@/components/CategoryFilter' // NEW: Import CategoryFilter
import { prisma } from '@/lib/prisma'
import type { Category } from '@prisma/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'

// Define props to accept search parameters
interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Authentication check
  const { userId } = await auth()

  if (!userId) {
    console.error('Dashboard accessed without authenticated user, redirecting.')
    redirect('/sign-in')
  }

  // Await searchParams before using
  const resolvedSearchParams = await searchParams

  // Get the current category filter from searchParams for server-side logic
  const currentCategoryFilter =
    typeof resolvedSearchParams?.category === 'string' &&
    resolvedSearchParams.category !== '' &&
    resolvedSearchParams.category !== 'all-categories'
      ? resolvedSearchParams.category
      : undefined

  // Fetch user categories for the forms and filter
  let userCategories: Category[] = []
  try {
    userCategories = await prisma.category.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Continue without categories if there's an error
  }

  return (
    <main className='container mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6'>
      {/* Page Header */}
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-xl font-bold sm:text-2xl lg:text-3xl'>
          Your Habits
        </h1>
        <p className='text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base'>
          Track your daily habits and build lasting routines
        </p>
      </div>

      {/* Category Management Section */}
      <div className='mb-4 sm:mb-6'>
        <CategoryManagement categories={userCategories} />
      </div>

      {/* Add Habit Form Section */}
      <Card className='mb-4 sm:mb-6 lg:mb-8'>
        <CardHeader className='p-4 sm:p-6'>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Plus className='h-4 w-4 sm:h-5 sm:w-5' />
            Add New Habit
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Create a new habit to start tracking your progress
          </CardDescription>
        </CardHeader>
        <CardContent className='p-4 pt-0 sm:p-6'>
          <AddHabitForm categories={userCategories} />
        </CardContent>
      </Card>

      {/* Category Filter Section */}
      <div className='mb-4 sm:mb-6'>
        <CategoryFilter categories={userCategories} />
      </div>

      {/* Habits Display Section */}
      <section aria-labelledby='habits-section-title'>
        <h2 id='habits-section-title' className='sr-only'>
          Your Habit List
        </h2>
        <DailyHabitView currentCategoryFilter={currentCategoryFilter} />
      </section>
    </main>
  )
}

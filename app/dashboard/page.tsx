// app/dashboard/page.tsx - Updated with CategoryFilter

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
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Your Habits</h1>
        <p className='text-muted-foreground mt-2'>
          Track your daily habits and build lasting routines
        </p>
      </div>

      {/* Category Management Section */}
      <CategoryManagement categories={userCategories} />

      {/* Add Habit Form Section */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            Add New Habit
          </CardTitle>
          <CardDescription>
            Create a new habit to start tracking your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddHabitForm categories={userCategories} />
        </CardContent>
      </Card>

      {/* NEW: Category Filter Section */}
      <div className='mb-6'>
        <CategoryFilter categories={userCategories} />
      </div>

      {/* Section for displaying the list of habits with full functionality */}
      <section>
        <DailyHabitView currentCategoryFilter={currentCategoryFilter} />
      </section>
    </div>
  )
}

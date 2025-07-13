// components/DailyHabitView.tsx

import React from 'react'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// ShadCN UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Flame, Trophy, Target } from 'lucide-react'

// Import types and Prisma
import type { Category, Habit, HabitRecord, Prisma } from '@prisma/client'

// Import components
import HabitHeatmap from './HabitHeatmap'
import EditHabitDialog from './EditHabitDialog'
import DeleteHabitButton from './DeleteHabitButton'
import HabitCheckbox from './HabitCheckbox'

// Import helper and streak calculation function from streaks utility
import { calculateStreaks, StreakResult } from '@/lib/streaks'

// Import analytics function for completion percentage
import { calculateCompletionPercentage, getUTCDate } from '@/lib/analytics'

// --- Helper Functions for Date Range ---
function getStartOfDayUTC(date: Date): Date {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function getEndOfDayUTC(date: Date): Date {
  const end = new Date(date)
  end.setUTCDate(end.getUTCDate() + 1)
  end.setUTCHours(0, 0, 0, 0)
  return end
}

// Define props interface
interface DailyHabitViewProps {
  currentCategoryFilter?: string // Optional category filter prop
}

// Update type alias: use 'records' to match Prisma schema relation name
type HabitWithDetails = Habit & {
  records: Pick<HabitRecord, 'id' | 'date' | 'completed'>[] // Match your Prisma schema relation name
  category: Category | null
}

/**
 * DailyHabitView - Server Component
 * Now includes category data with each habit
 */
export default async function DailyHabitView({
  currentCategoryFilter,
}: DailyHabitViewProps) {
  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) throw new Error('User not authenticated.')
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in DailyHabitView:', error)
    return (
      <p className='text-destructive mt-4 text-center'>
        Authentication required to view habits.
      </p>
    )
  }

  // --- 2. Data Fetching ---
  let habitsWithDetails: HabitWithDetails[] = []
  let userCategories: Category[] = []

  try {
    const today = new Date()
    const startOfToday = getStartOfDayUTC(today)
    const endOfToday = getEndOfDayUTC(today)

    console.log(`Fetching all habit records for streak calculation`)
    console.log(
      `Category filter: ${currentCategoryFilter || 'None (All Categories)'}`
    )

    // Build the 'where' clause for the habits query dynamically
    const habitWhereClause: Prisma.HabitWhereInput = {
      userId: userId,
      // Conditionally add categoryId filter if currentCategoryFilter is provided
      ...(currentCategoryFilter && { categoryId: currentCategoryFilter }),
    }

    // Fetch habits and categories concurrently
    ;[habitsWithDetails, userCategories] = await Promise.all([
      // Fetch habits with the dynamic where clause
      prisma.habit.findMany({
        where: habitWhereClause, // Use the dynamically built where clause
        include: {
          records: {
            where: {
              date: {
                gte: startOfToday,
                lt: endOfToday,
              },
            },
            take: 1,
            select: { id: true, date: true, completed: true }, // Select specific fields
          },
          // Include the full related category object
          category: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      // Fetch categories
      prisma.category.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    console.log(
      'Fetched habits with category details:',
      JSON.stringify(habitsWithDetails, null, 2)
    )
  } catch (error) {
    console.error(
      'Database Error: Failed to fetch habits/records for DailyHabitView:',
      error
    )
    // Set empty arrays on error
    habitsWithDetails = []
    userCategories = []
  }

  // --- 3. Empty State ---
  if (habitsWithDetails.length === 0) {
    // Provide context if filtered
    const message = currentCategoryFilter
      ? 'No habits found in this category.'
      : 'No habits found. Add one to get started!'

    return (
      <Card className='mt-4 border-dashed shadow-none'>
        <CardHeader className='items-center text-center'>
          <CardTitle>
            {currentCategoryFilter ? 'No Habits in Category' : 'No Habits Yet!'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-muted-foreground text-sm'>
            {currentCategoryFilter
              ? 'Try selecting a different category or add a new habit to this category.'
              : '(You will see your habits listed here for daily tracking.)'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // --- 4. Render Habit List with Category Information ---
  // Find today's date for checkbox logic (since we now fetch all records)
  const startOfSelectedDay = getUTCDate(new Date())

  return (
    <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {habitsWithDetails.map((habit) => {
        // Define period for analytics here (in the map scope)
        const todayUTC = getUTCDate(new Date())
        const endDatePeriod = todayUTC // End date is today
        const startDatePeriod = getUTCDate(
          new Date(
            Date.UTC(
              todayUTC.getUTCFullYear(),
              todayUTC.getUTCMonth(),
              todayUTC.getUTCDate() - 6
            )
          )
        ) // Start date is 6 days ago (for 7-day period)

        // Find today's record from the complete fetched list
        const todayRecord = habit.records.find((record) => {
          // Add defensive check for invalid dates in records
          if (!record.date || isNaN(getUTCDate(record.date).getTime()))
            return false
          return (
            getUTCDate(record.date).getTime() === startOfSelectedDay.getTime()
          )
        })
        const isCompletedToday = todayRecord?.completed ?? false
        const categoryName = habit.category?.name // Access category name

        // 🔥 Calculate streaks using the complete habit history
        const streaks: StreakResult = calculateStreaks(habit.records)

        // 📊 Calculate completion percentage for the last 7 days
        const completionPercentageLast7Days = calculateCompletionPercentage(
          habit.records,
          startDatePeriod, // Now defined in this scope
          endDatePeriod // Now defined in this scope
        )

        // Helper for pluralization
        const pluralizeDays = (count: number) => (count === 1 ? 'day' : 'days')

        return (
          <Card
            key={habit.id}
            className='bg-card flex flex-col transition-all duration-150 ease-in-out hover:shadow-md'
          >
            <CardHeader>
              <CardTitle className='truncate text-lg font-semibold'>
                {habit.name}
              </CardTitle>
              <CardDescription className='text-sm'>
                Frequency:{' '}
                {habit.frequency.charAt(0).toUpperCase() +
                  habit.frequency.slice(1)}
                {/* Display category name if it exists */}
                {categoryName && (
                  <span className='text-primary/80 bg-primary/10 ml-2 rounded px-1.5 py-0.5 text-xs font-medium'>
                    {categoryName}
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-grow flex-col justify-between'>
              {/* Optional Description */}
              {habit.description ? (
                <p className='text-muted-foreground mb-4 text-sm'>
                  {habit.description}
                </p>
              ) : (
                <div className='mb-4'></div>
              )}

              {/* Daily Tracking Status */}
              <div className='mt-auto pt-4'>
                <HabitCheckbox
                  habitId={habit.id}
                  habitName={habit.name}
                  date={new Date()}
                  initialCompleted={isCompletedToday}
                />
              </div>

              {/* Progress heatmap visualization */}
              <div className='mt-4 border-t border-dashed pt-4'>
                <div className='mb-2'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Progress Overview
                  </h4>
                </div>
                <HabitHeatmap habitId={habit.id} habitName={habit.name} />
              </div>

              {/* 📊 Enhanced Analytics Display with Completion Percentage */}
              <div className='text-muted-foreground mt-4 space-y-2 border-t pt-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <Flame className='h-4 w-4 text-orange-500' />
                  <span>
                    Current Streak:{' '}
                    <span className='text-foreground font-medium'>
                      {streaks.currentStreak}
                    </span>{' '}
                    {pluralizeDays(streaks.currentStreak)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-yellow-500' />
                  <span>
                    Longest Streak:{' '}
                    <span className='text-foreground font-medium'>
                      {streaks.longestStreak}
                    </span>{' '}
                    {pluralizeDays(streaks.longestStreak)}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-blue-500' />
                  <span>
                    Last 7 Days:{' '}
                    <span className='text-foreground font-medium'>
                      {completionPercentageLast7Days}%
                    </span>{' '}
                    completed
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className='flex justify-end gap-2 border-t pt-4'>
              {/* Edit Button wrapped with EditHabitDialog */}
              <EditHabitDialog habit={habit} categories={userCategories}>
                <Button
                  variant='outline'
                  size='icon'
                  aria-label={`Edit habit: ${habit.name}`}
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              </EditHabitDialog>

              {/* Delete Button with Confirmation Dialog */}
              <DeleteHabitButton habitId={habit.id} habitName={habit.name} />
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

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
import { Pencil } from 'lucide-react'

// Import types
import type { Category } from '@prisma/client'

// Import components
import HabitHeatmap from './HabitHeatmap'
import EditHabitDialog from './EditHabitDialog'
import DeleteHabitButton from './DeleteHabitButton'

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

/**
 * DailyHabitView - Server Component
 * Now includes HabitHeatmap visualization in each habit card
 */
export default async function DailyHabitView() {
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
  let habitsWithTodayRecord = []
  let userCategories: Category[] = []

  try {
    const today = new Date()
    const startOfToday = getStartOfDayUTC(today)
    const endOfToday = getEndOfDayUTC(today)

    console.log(
      `Fetching records between: ${startOfToday.toISOString()} and ${endOfToday.toISOString()}`
    )

    // Fetch habits and categories concurrently
    ;[habitsWithTodayRecord, userCategories] = await Promise.all([
      // Fetch habits
      prisma.habit.findMany({
        where: {
          userId: userId,
        },
        include: {
          records: {
            where: {
              date: {
                gte: startOfToday,
                lt: endOfToday,
              },
            },
            take: 1,
          },
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
      'Fetched habits with records:',
      JSON.stringify(habitsWithTodayRecord, null, 2)
    )
  } catch (error) {
    console.error(
      'Database Error: Failed to fetch habits/records for DailyHabitView:',
      error
    )
    return (
      <Card className='bg-destructive/10 border-destructive mt-4'>
        <CardHeader>
          <CardTitle className='text-destructive'>Database Error</CardTitle>
          <CardDescription className='text-destructive'>
            Could not load habits. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // --- 3. Empty State ---
  if (habitsWithTodayRecord.length === 0) {
    return (
      <Card className='mt-4 border-dashed shadow-none'>
        <CardHeader className='items-center text-center'>
          <CardTitle>No Habits Yet!</CardTitle>
          <CardDescription>
            Add your first habit using the form above to start tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-muted-foreground text-sm'>
            (You'll see your habits listed here for daily tracking.)
          </p>
        </CardContent>
      </Card>
    )
  }

  // --- 4. Render Habit List with Heatmap ---
  return (
    <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {habitsWithTodayRecord.map((habit) => {
        const todayRecord = habit.records?.[0]
        const isCompletedToday = todayRecord?.completed ?? false

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
                <div
                  className={`flex h-10 items-center justify-center rounded border text-xs ${
                    isCompletedToday
                      ? 'border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/30'
                      : 'bg-muted/30'
                  }`}
                >
                  Status: {isCompletedToday ? '✅ Done' : '⬜ Pending'}
                  <span className='text-muted-foreground ml-2'>
                    (Checkbox/Button Placeholder)
                  </span>
                </div>
              </div>

              {/* 2. Render the HabitHeatmap component */}
              <div className='mt-4 border-t border-dashed pt-4'>
                <div className='mb-2'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Progress Overview
                  </h4>
                </div>
                <HabitHeatmap habitId={habit.id} habitName={habit.name} />
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

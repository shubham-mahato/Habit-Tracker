// app/dashboard/page.tsx - Updated with DailyHabitView

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import DailyHabitView from '@/components/DailyHabitView'
import AddHabitForm from '@/components/AddHabitForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  // Authentication check
  const { userId } = await auth()

  if (!userId) {
    console.error('Dashboard accessed without authenticated user, redirecting.')
    redirect('/sign-in')
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Your Habits</h1>
        <p className='text-muted-foreground mt-2'>
          Track your daily habits and build lasting routines
        </p>
      </div>

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
          <AddHabitForm />
        </CardContent>
      </Card>

      {/* Section for displaying the list of habits with full functionality */}
      <section>
        <DailyHabitView />
      </section>
    </div>
  )
}

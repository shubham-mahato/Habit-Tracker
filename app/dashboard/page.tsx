// app/dashboard/page.tsx - Simple version following the guide exactly

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import HabitList from '@/components/HabitList'

export default async function DashboardPage() {
  // Authentication check
  const { userId } = await auth()

  if (!userId) {
    console.error('Dashboard accessed without authenticated user, redirecting.')
    redirect('/sign-in')
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Your Habits</h1>
        {/* Placeholder: Add Habit Button will likely go here */}
        {/* <AddHabitButton /> */}
      </div>

      {/* Section for displaying the list of habits */}
      <section>
        {/* Replace the placeholder with the actual HabitList component */}
        <HabitList />
      </section>
    </div>
  )
}

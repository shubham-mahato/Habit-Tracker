// app/dashboard/page.tsx - Simple version following the guide exactly

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  // Authentication check
  const { userId } = await auth();
  
  if (!userId) {
    console.error("Dashboard accessed without authenticated user, redirecting.");
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Habits</h1>
        {/* Placeholder: Add Habit Button will likely go here */}
        {/* <AddHabitButton /> */}
      </div>

      {/* Section for displaying the list of habits */}
      <section>
        {/* We will replace this placeholder div with the <HabitList /> component
            in the next task. That component will fetch the habits for 'userId'
            and render them using the Card-based layout we designed.
            The layout might use a grid structure like below.
        */}
        <div className="p-4 border rounded border-dashed text-muted-foreground">
           <p className="text-center">Habit List Area</p>
           <p className="text-center text-sm">(A grid of Habit Cards will appear here)</p>
           {/* Conceptual Grid Structure (Implementation will be in HabitList.tsx): */}
           {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"> */}
             {/* <Card>...</Card> */}
             {/* <Card>...</Card> */}
           {/* </div> */}
        </div>
      </section>
    </div>
  );
}
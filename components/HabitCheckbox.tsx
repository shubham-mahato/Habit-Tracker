// components/HabitCheckbox.tsx

'use client'

// 1. Import useState along with useTransition
import React, { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'

// Import ShadCN components
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

// Import the Server Action
import { toggleHabitCompletion, ToggleHabitState } from '@/app/actions/habits'

// Props interface
interface HabitCheckboxProps {
  habitId: string
  habitName: string
  date: Date
  initialCompleted: boolean
}

export default function HabitCheckbox({
  habitId,
  habitName,
  date,
  initialCompleted,
}: HabitCheckboxProps) {
  const [isPending, startTransition] = useTransition()

  // 2. Use useState for optimistic UI state
  // Initialize with the value passed from the server component
  const [isChecked, setIsChecked] = useState(initialCompleted)

  // 3. Sync state if the server prop changes (after revalidation)
  // This ensures consistency if the component re-renders with new server data
  // while an optimistic update was potentially in flight or failed.
  useEffect(() => {
    setIsChecked(initialCompleted)
  }, [initialCompleted])

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    const newCompletedState = checked === true

    // 4. Optimistically update the UI state *immediately*
    setIsChecked(newCompletedState)

    // 5. Start the transition to call the server action
    startTransition(async () => {
      try {
        const result: ToggleHabitState = await toggleHabitCompletion(
          habitId,
          date,
          newCompletedState
        )

        if (result.success) {
          // Success: The optimistic state is now confirmed by the server.
          // Revalidation will handle the next render's initialCompleted prop.
          console.log('Toggle successful (Optimistic):', result.message)
          // toast.success(result.message || "Habit status updated!"); // Optional success toast
        } else {
          // 6. Failure: Revert the optimistic UI update & show error
          console.error('Server action failed:', result.message, result.errors)
          toast.error(result.message || 'Failed to update habit status.', {
            description: result.errors?._form?.join(', '),
          })
          // Revert the state back to what it was before the optimistic change
          setIsChecked(!newCompletedState)
        }
      } catch (error) {
        // 7. Catch unexpected errors & revert optimistic UI update
        console.error('Error calling toggleHabitCompletion:', error)
        toast.error('An unexpected error occurred. Please try again.')
        // Revert the state back
        setIsChecked(!newCompletedState)
      }
    })
  }

  const checkboxId = `habit-${habitId}-${date.toISOString().split('T')[0]}`

  return (
    <div className='flex h-6 items-center space-x-2 py-2'>
      {isPending ? (
        <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
      ) : (
        <Checkbox
          id={checkboxId}
          // 8. Use the local `isChecked` state for the checked prop
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          disabled={isPending} // Still disable during transition
          aria-disabled={isPending}
          aria-label={`Mark ${habitName} as ${isChecked ? 'incomplete' : 'complete'} for ${date.toLocaleDateString()}`}
        />
      )}
      <Label
        htmlFor={checkboxId}
        // 9. Style the label based on the local `isChecked` state
        className={`text-sm transition-colors ${
          isChecked ? 'text-muted-foreground line-through' : 'text-foreground'
        } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {/* 10. Update label text based on local `isChecked` state */}
        {isChecked ? 'Completed' : 'Mark as complete'}
      </Label>
    </div>
  )
}

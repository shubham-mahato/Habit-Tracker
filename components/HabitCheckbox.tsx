// src/components/HabitCheckbox.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, Circle } from 'lucide-react'
import { toggleHabitCompletion } from '@/app/actions/habits'

interface HabitCheckboxProps {
  habitId: string
  habitName: string
  date: Date
  initialCompleted: boolean
}

/**
 * HabitCheckbox Component
 *
 * Allows users to mark habits as complete/incomplete for a specific date
 */
export default function HabitCheckbox({
  habitId,
  habitName,
  date,
  initialCompleted,
}: HabitCheckboxProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()

  const handleToggle = async (checked: boolean) => {
    setIsCompleted(checked)

    startTransition(async () => {
      try {
        const result = await toggleHabitCompletion({
          habitId,
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          completed: checked,
        })

        if (result.success) {
          toast.success(
            checked
              ? `✅ Marked "${habitName}" as complete!`
              : `⬜ Marked "${habitName}" as incomplete`
          )
        } else {
          throw new Error(result.message || 'Failed to update habit')
        }
      } catch (error) {
        console.error('Error updating habit completion:', error)
        // Revert the state if there was an error
        setIsCompleted(!checked)
        toast.error('Failed to update habit. Please try again.')
      }
    })
  }

  return (
    <div className='bg-muted/30 hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors'>
      <div className='flex items-center space-x-2'>
        {isPending ? (
          <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
        ) : (
          <Checkbox
            id={`habit-${habitId}`}
            checked={isCompleted}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className='h-5 w-5'
          />
        )}
        <Label
          htmlFor={`habit-${habitId}`}
          className={`cursor-pointer font-medium transition-colors ${
            isCompleted ? 'text-green-700 line-through' : 'text-foreground'
          }`}
        >
          {isCompleted ? 'Completed today' : 'Mark as complete'}
        </Label>
      </div>

      {/* Status indicator */}
      <div className='ml-auto flex items-center'>
        {isCompleted ? (
          <CheckCircle2 className='h-4 w-4 text-green-600' />
        ) : (
          <Circle className='text-muted-foreground h-4 w-4' />
        )}
      </div>
    </div>
  )
}

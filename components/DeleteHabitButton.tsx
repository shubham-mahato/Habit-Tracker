// src/components/DeleteHabitButton.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'

// Import ShadCN AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

// Import the Server Action and its state type
import { deleteHabit, DeleteHabitState } from '@/app/actions/habits'

// Define props
interface DeleteHabitButtonProps {
  habitId: string
  habitName: string
}

/**
 * DeleteHabitButton Client Component
 *
 * Renders a delete button that triggers a confirmation dialog (AlertDialog).
 * Calls the deleteHabit Server Action upon confirmation.
 */
export default function DeleteHabitButton({
  habitId,
  habitName,
}: DeleteHabitButtonProps) {
  // State to control dialog visibility
  const [isOpen, setIsOpen] = useState(false)
  // State for pending server action
  const [isPending, startTransition] = useTransition()

  // Function to handle the actual deletion confirmation
  const handleDeleteConfirm = () => {
    startTransition(async () => {
      try {
        console.log(`Confirming deletion for habit ID: ${habitId}`)
        const result: DeleteHabitState = await deleteHabit(habitId)

        if (result.success) {
          toast.success(result.message || `Habit '${habitName}' deleted.`)
          setIsOpen(false) // Close dialog on success
        } else {
          // Show error toast if action failed on the server
          toast.error(result.message || 'Failed to delete habit.', {
            description:
              result.errors?._form?.join(', ') ||
              result.errors?.habitId?.join(', '),
          })
          // Keep the dialog open on error for retry
        }
      } catch (error) {
        // Catch unexpected errors during the action call itself
        console.error('Error calling deleteHabit action:', error)
        toast.error('An unexpected error occurred. Please try again.')
        // Close the dialog even if there's an unexpected error
        setIsOpen(false)
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* The trigger: Our styled delete button */}
      <AlertDialogTrigger asChild>
        <Button
          variant='destructive'
          size='icon'
          aria-label={`Delete habit: ${habitName}`}
          disabled={isPending} // Disable trigger while action is running
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>

      {/* The confirmation dialog content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the habit
            <strong className='mx-1'>"{habitName}"</strong>
            and all associated tracking records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Cancel button simply closes the dialog */}
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          {/* Confirm button calls the delete handler */}
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

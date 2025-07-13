// components/AddHabitForm.tsx

'use client'

import React, { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

// ShadCN UI Components
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Import the Server Action AND the State Type
import { addHabitWithState, type AddHabitFormState } from '@/app/actions/habits'

// Import types for categories
import type { Category } from '@prisma/client'

// Import the toast function from sonner
import { toast } from 'sonner'

// --- SubmitButton Component ---
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type='submit'
      className='w-full'
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Adding...
        </>
      ) : (
        'Add Habit'
      )}
    </Button>
  )
}

// --- Initial State ---
const initialState: AddHabitFormState = {
  success: false,
  message: null,
  errors: null,
}

// --- Main Form Component ---
export default function AddHabitForm({
  onFormSubmitSuccess,
  categories = [], // NEW: Accept categories array with default empty array
}: {
  onFormSubmitSuccess?: () => void
  categories?: Category[] // NEW: Optional categories prop
}) {
  const [state, formAction] = useFormState(addHabitWithState, initialState)
  const formRef = useRef<HTMLFormElement>(null) // Ref for resetting the form

  // Use useEffect to react to state changes and show toasts
  useEffect(() => {
    // Check if the action has completed (message is present)
    if (state.message) {
      if (state.success) {
        // Show success toast
        toast.success(state.message)
        // Optional: Call callback to close dialog/sheet
        onFormSubmitSuccess?.()
        // Optional: Reset the form on success
        formRef.current?.reset()
      } else {
        // Show error toast (for general form errors or DB errors)
        // Specific field errors are already displayed inline
        toast.error(state.message, {
          description: state.errors?._form?.join(', '), // Optionally add more detail
        })
      }
    }
    // Dependency array: run this effect when the state object reference changes.
  }, [state, onFormSubmitSuccess])

  return (
    // Add ref to the form element
    <form ref={formRef} action={formAction} className='space-y-4'>
      {/* --- Habit Name Field --- */}
      <div className='space-y-1'>
        <Label htmlFor='name'>Habit Name</Label>
        <Input
          id='name'
          name='name'
          type='text'
          placeholder='e.g., Drink 8 glasses of water'
          required
          // Add aria-describedby for accessibility if error exists
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {/* Display validation errors for the 'name' field */}
        {state.errors?.name && (
          <p id='name-error' className='text-destructive text-sm font-medium'>
            {state.errors.name.join(', ')} {/* Join if multiple errors */}
          </p>
        )}
      </div>

      {/* --- Habit Description Field (Optional) --- */}
      <div className='space-y-1'>
        <Label htmlFor='description'>Description (Optional)</Label>
        <Textarea
          id='description'
          name='description'
          placeholder='e.g., Track daily water intake for better hydration'
          rows={3}
          aria-describedby={
            state.errors?.description ? 'description-error' : undefined
          }
        />
        {/* Display validation errors for the 'description' field */}
        {state.errors?.description && (
          <p
            id='description-error'
            className='text-destructive text-sm font-medium'
          >
            {state.errors.description.join(', ')}
          </p>
        )}
      </div>

      {/* --- Habit Frequency Field --- */}
      <div className='space-y-1'>
        <Label htmlFor='frequency'>Frequency</Label>
        <Select name='frequency' required defaultValue='daily'>
          <SelectTrigger
            id='frequency'
            aria-describedby={
              state.errors?.frequency ? 'frequency-error' : undefined
            }
          >
            <SelectValue placeholder='Select frequency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='daily'>Daily</SelectItem>
            <SelectItem value='weekly'>Weekly</SelectItem>
          </SelectContent>
        </Select>
        {/* Display validation errors for the 'frequency' field */}
        {state.errors?.frequency && (
          <p
            id='frequency-error'
            className='text-destructive text-sm font-medium'
          >
            {state.errors.frequency.join(', ')}
          </p>
        )}
      </div>

      {/* --- NEW: Category Field --- */}
      <div className='space-y-1'>
        <Label htmlFor='categoryId'>Category (Optional)</Label>
        <Select name='categoryId' defaultValue='no-category'>
          <SelectTrigger
            id='categoryId'
            aria-describedby={
              state.errors?.categoryId ? 'categoryId-error' : undefined
            }
          >
            <SelectValue placeholder='Select a category (optional)' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='no-category'>No Category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Display validation errors for the 'categoryId' field */}
        {state.errors?.categoryId && (
          <p
            id='categoryId-error'
            className='text-destructive text-sm font-medium'
          >
            {state.errors.categoryId.join(', ')}
          </p>
        )}
      </div>

      {/* --- General Form Errors --- */}
      {/* Display general form errors (like auth or db errors) */}
      {state.errors?._form && (
        <div className='text-destructive bg-destructive/10 rounded-md p-3 text-sm font-medium'>
          <ul>
            {state.errors._form.map((error: string, index: number) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Submit Button --- */}
      <div className='pt-2'>
        <SubmitButton />
      </div>
    </form>
  )
}

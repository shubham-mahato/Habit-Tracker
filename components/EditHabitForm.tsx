// components/EditHabitForm.tsx

'use client'

import React, { useState } from 'react'
import { z } from 'zod'

// Import ShadCN components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Import Prisma types for the habit prop
import type { Habit } from '@prisma/client'

// Define props for the form
interface EditHabitFormProps {
  habit: Habit // The habit object to pre-fill the form
  onFormSubmit?: () => Promise<void> // For future Server Action integration
  onCancel?: () => void // To close dialog from within form
}

// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Habit name cannot be empty.'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly']), // Match your Prisma enum/type
})

type FormData = z.infer<typeof formSchema>

/**
 * EditHabitForm Client Component
 *
 * Renders the form fields for editing a habit, pre-filled with existing data.
 * Manages the form's input state.
 */
export default function EditHabitForm({ habit, onCancel }: EditHabitFormProps) {
  // --- State Management ---
  // Initialize form state with the habit data passed via props
  const [formData, setFormData] = useState<FormData>({
    name: habit.name,
    description: habit.description ?? '', // Handle null description
    frequency: habit.frequency as 'daily' | 'weekly', // Ensure type matches
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmitting, setIsSubmitting] = useState(false) // For loading state

  // --- Input Change Handler ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // --- Select Change Handler ---
  const handleFrequencyChange = (value: 'daily' | 'weekly') => {
    setFormData((prev) => ({ ...prev, frequency: value }))
    if (errors.frequency) {
      setErrors((prev) => ({ ...prev, frequency: undefined }))
    }
  }

  // --- Form Submission Handler (Placeholder for now) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({}) // Clear previous errors

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData)

      console.log('Form submitted with data:', validatedData)
      console.log('Original Habit ID:', habit.id)

      // !!! IMPORTANT !!!
      // In future tasks, this function will:
      // 1. Call the `editHabit` Server Action, passing `habit.id` and `validatedData`.
      // 2. Handle the response (success/error) from the Server Action.
      // 3. Show feedback (e.g., toasts).
      // 4. Call a prop function to close the dialog on success.

      // Placeholder delay to simulate action
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Example: If successful, close the dialog
      if (onCancel) onCancel()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message
          }
        })
        setErrors(formattedErrors)
      } else {
        console.error('Form submission error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
      {/* Name Field */}
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='name' className='text-right'>
          Name
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className='col-span-3'
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          required
        />
        {errors.name && (
          <p
            id='name-error'
            className='text-destructive col-span-4 text-right text-sm'
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className='grid grid-cols-4 items-start gap-4'>
        <Label htmlFor='description' className='pt-2 text-right'>
          Description
        </Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          placeholder='(Optional) Add more details...'
          className='col-span-3 min-h-[80px]'
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
        />
        {errors.description && (
          <p
            id='description-error'
            className='text-destructive col-span-4 text-right text-sm'
          >
            {errors.description}
          </p>
        )}
      </div>

      {/* Frequency Field */}
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='frequency' className='text-right'>
          Frequency
        </Label>
        <Select
          name='frequency'
          value={formData.frequency}
          onValueChange={handleFrequencyChange}
          required
        >
          <SelectTrigger
            id='frequency'
            className='col-span-3'
            aria-invalid={!!errors.frequency}
          >
            <SelectValue placeholder='Select frequency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='daily'>Daily</SelectItem>
            <SelectItem value='weekly'>Weekly</SelectItem>
            {/* Add other frequencies if your schema supports them */}
          </SelectContent>
        </Select>
        {errors.frequency && (
          <p
            id='frequency-error'
            className='text-destructive col-span-4 text-right text-sm'
          >
            {errors.frequency}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 pt-4'>
        {onCancel && (
          <Button type='button' variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

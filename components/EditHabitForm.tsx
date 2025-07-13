// src/components/EditHabitForm.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { z } from 'zod'
import { toast } from 'sonner' // For feedback

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
import { Loader2 } from 'lucide-react' // For loading indicator

// Import Prisma type and the Server Action
import type { Habit, Category } from '@prisma/client'
import { editHabit, EditHabitState } from '@/app/actions/habits'

// Define props for the form
interface EditHabitFormProps {
  habit: Habit & { categoryId?: string | null } // Ensure categoryId is available
  categories: Category[] // NEW: Accept categories array
  onFormSubmit?: () => void // Function to call on successful submission
  onCancel?: () => void // To close dialog from within form
}

// Define the Zod schema (should match the one in the Server Action)
const EditHabitSchema = z.object({
  name: z.string().min(1, { message: 'Habit name cannot be empty.' }).max(100),
  description: z.string().max(500).optional().nullable(),
  frequency: z.enum(['daily', 'weekly'], {
    errorMap: () => ({ message: 'Please select a valid frequency.' }),
  }),
  // NEW: Add optional categoryId validation
  categoryId: z
    .string()
    .cuid({ message: 'Invalid category selected.' })
    .optional()
    .nullable(),
})

type EditHabitFormData = z.infer<typeof EditHabitSchema>

// Define type for form errors matching Zod's flattened errors
type FormErrors = z.ZodFormattedError<EditHabitFormData, string> | null

/**
 * EditHabitForm Client Component
 *
 * Renders the form fields for editing a habit, pre-filled with existing data.
 * Manages the form's input state.
 */
export default function EditHabitForm({
  habit,
  categories,
  onFormSubmit,
  onCancel,
}: EditHabitFormProps) {
  // Use useTransition for pending state
  const [isPending, startTransition] = useTransition()

  // --- State Management ---
  // Initialize form state with the habit data passed via props
  const [formData, setFormData] = useState<EditHabitFormData>({
    name: habit.name,
    description: habit.description ?? '', // Handle null description
    frequency: habit.frequency as 'daily' | 'weekly', // Ensure type matches
    categoryId: habit.categoryId ?? undefined, // NEW: Initialize categoryId
  })
  // State specifically for Zod validation errors
  const [errors, setErrors] = useState<FormErrors>(null)

  // --- Input Change Handler ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear errors for the field being edited
    if (errors?.[name as keyof EditHabitFormData]?._errors) {
      setErrors((prev) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors[name as keyof EditHabitFormData]
        return newErrors
      })
    }
  }

  // --- Select Change Handler ---
  const handleFrequencyChange = (value: 'daily' | 'weekly') => {
    setFormData((prev) => ({ ...prev, frequency: value }))
    if (errors?.frequency?._errors) {
      setErrors((prev) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors.frequency
        return newErrors
      })
    }
  }

  // NEW: Handler for Category Select
  const handleCategoryChange = (value: string) => {
    // Map empty string value from "No Category" option back to undefined for schema
    setFormData((prev) => ({
      ...prev,
      categoryId: value === '' ? undefined : value,
    }))
    if (errors?.categoryId?._errors) {
      setErrors((prev) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors.categoryId
        return newErrors
      })
    }
  }

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors(null) // Clear previous errors

    // --- Client-side Validation ---
    const validation = EditHabitSchema.safeParse({
      ...formData,
      // Ensure categoryId is null if undefined/empty string before validation
      categoryId: formData.categoryId || null,
    })

    if (!validation.success) {
      const zodErrors = validation.error.format()
      setErrors(zodErrors)
      toast.error('Please check the form for errors.')
      console.error('Client-side validation failed:', zodErrors)
      return // Stop submission if validation fails
    }

    // --- Call Server Action ---
    startTransition(async () => {
      try {
        console.log(
          `Calling editHabit for ID: ${habit.id} with data:`,
          validation.data
        )
        const result: EditHabitState = await editHabit(
          habit.id,
          validation.data
        )

        if (result.success) {
          toast.success(result.message || 'Habit updated successfully!')
          // Call the callback prop to close the dialog (if provided)
          if (onFormSubmit) {
            onFormSubmit()
          }
        } else {
          // Handle errors returned from the server action
          toast.error(result.message || 'Failed to update habit.')
          if (result.errors) {
            // Map server errors back to the form fields if possible
            const serverErrors: FormErrors = {
              _errors: result.errors._form || [],
            }
            if (result.errors.name)
              serverErrors.name = { _errors: result.errors.name }
            if (result.errors.description)
              serverErrors.description = { _errors: result.errors.description }
            if (result.errors.frequency)
              serverErrors.frequency = { _errors: result.errors.frequency }
            setErrors(serverErrors)
            console.error('Server action failed:', result.errors)
          }
        }
      } catch (error) {
        // Catch unexpected errors during the action call
        console.error('Error submitting edit form:', error)
        toast.error('An unexpected error occurred. Please try again.')
        setErrors({ _errors: ['An unexpected error occurred.'] })
      }
    })
  }

  // Helper to get error message for a field
  const getFieldError = (
    fieldName: keyof EditHabitFormData
  ): string | undefined => {
    return errors?.[fieldName]?._errors[0]
  }

  return (
    <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
      {/* Name Field */}
      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
        <Label htmlFor='name' className='text-right'>
          Name
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className='col-span-3'
          aria-invalid={!!getFieldError('name')}
          aria-describedby={getFieldError('name') ? 'name-error' : undefined}
          required
        />
        {getFieldError('name') && (
          <p
            id='name-error'
            className='text-destructive col-span-3 col-start-2 text-sm'
          >
            {getFieldError('name')}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className='grid grid-cols-4 items-start gap-x-4 gap-y-1'>
        <Label htmlFor='description' className='pt-2 text-right'>
          Description
        </Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description ?? ''}
          onChange={handleChange}
          placeholder='(Optional) Add more details...'
          className='col-span-3 min-h-[80px]'
          aria-invalid={!!getFieldError('description')}
          aria-describedby={
            getFieldError('description') ? 'description-error' : undefined
          }
        />
        {getFieldError('description') && (
          <p
            id='description-error'
            className='text-destructive col-span-3 col-start-2 text-sm'
          >
            {getFieldError('description')}
          </p>
        )}
      </div>

      {/* Frequency Field */}
      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
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
            aria-invalid={!!getFieldError('frequency')}
          >
            <SelectValue placeholder='Select frequency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='daily'>Daily</SelectItem>
            <SelectItem value='weekly'>Weekly</SelectItem>
            {/* Add other frequencies if your schema supports them */}
          </SelectContent>
        </Select>
        {getFieldError('frequency') && (
          <p
            id='frequency-error'
            className='text-destructive col-span-3 col-start-2 text-sm'
          >
            {getFieldError('frequency')}
          </p>
        )}
      </div>

      {/* --- NEW: Category Field --- */}
      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
        <Label htmlFor='categoryId' className='text-right'>
          Category
        </Label>
        <Select
          name='categoryId'
          value={formData.categoryId ?? ''}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger
            id='categoryId'
            className='col-span-3'
            aria-invalid={!!getFieldError('categoryId')}
          >
            <SelectValue placeholder='Select a category (optional)' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>No Category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError('categoryId') && (
          <p
            id='categoryId-error'
            className='text-destructive col-span-3 col-start-2 text-sm'
          >
            {getFieldError('categoryId')}
          </p>
        )}
      </div>

      {/* General Form Errors */}
      {errors?._errors && errors._errors.length > 0 && (
        <div className='text-destructive bg-destructive/10 col-span-4 rounded-md p-2 text-sm'>
          {errors._errors.join(', ')}
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 pt-4'>
        {onCancel && (
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}

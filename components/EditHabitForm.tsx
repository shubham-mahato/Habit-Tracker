// src/components/EditHabitForm.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { Loader2 } from 'lucide-react'
import type { Habit, Category } from '@prisma/client'
import { editHabit, EditHabitState } from '@/app/actions/habits'

// Define props for the form
interface EditHabitFormProps {
  habit: Habit & { categoryId?: string | null }
  categories: Category[]
  onFormSubmit?: () => void
  onCancel?: () => void
}

// Define the Zod schema
const EditHabitSchema = z.object({
  name: z.string().min(1, { message: 'Habit name cannot be empty.' }).max(100),
  description: z.string().max(500).optional().nullable(),
  frequency: z.enum(['daily', 'weekly'], {
    errorMap: () => ({ message: 'Please select a valid frequency.' }),
  }),
  categoryId: z.string().optional().nullable(),
})

type EditHabitFormData = z.infer<typeof EditHabitSchema>

const UNCATEGORIZED_VALUE = 'uncategorized'

export default function EditHabitForm({
  habit,
  categories,
  onFormSubmit,
  onCancel,
}: EditHabitFormProps) {
  const [isPending, startTransition] = useTransition()

  // Safely handle categoryId - ensure it's never an empty string
  const safeCategoryId = habit.categoryId || undefined
  const selectValue = safeCategoryId || UNCATEGORIZED_VALUE

  console.log('EditHabitForm - habit.categoryId:', habit.categoryId)
  console.log('EditHabitForm - safeCategoryId:', safeCategoryId)
  console.log('EditHabitForm - selectValue:', selectValue)

  const [formData, setFormData] = useState<EditHabitFormData>({
    name: habit.name,
    description: habit.description || '',
    frequency: habit.frequency as 'daily' | 'weekly',
    categoryId: safeCategoryId,
  })

  const [errors, setErrors] = useState<any>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors?.[name]) {
      setErrors((prev: any) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFrequencyChange = (value: 'daily' | 'weekly') => {
    setFormData((prev) => ({ ...prev, frequency: value }))
    if (errors?.frequency) {
      setErrors((prev: any) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors.frequency
        return newErrors
      })
    }
  }

  const handleCategoryChange = (value: string) => {
    console.log('Category change value:', value)
    const categoryId = value === UNCATEGORIZED_VALUE ? undefined : value
    setFormData((prev) => ({ ...prev, categoryId }))
    if (errors?.categoryId) {
      setErrors((prev: any) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors.categoryId
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors(null)

    const validation = EditHabitSchema.safeParse({
      ...formData,
      categoryId: formData.categoryId || null,
    })

    if (!validation.success) {
      console.error('Validation Error:', validation.error.flatten().fieldErrors)
      setErrors(validation.error.flatten().fieldErrors)
      return
    }

    startTransition(async () => {
      try {
        const result: EditHabitState = await editHabit(
          habit.id,
          validation.data
        )
        if (result.success) {
          toast.success(result.message || 'Habit updated successfully!')
          onFormSubmit?.()
        } else {
          toast.error(result.message || 'Failed to update habit')
          if (result.errors) {
            setErrors(result.errors)
          }
        }
      } catch (error) {
        console.error('Unexpected Error:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  const getFieldError = (
    fieldName: keyof EditHabitFormData
  ): string | undefined => {
    return errors?.[fieldName]?.[0]
  }

  // Safe select value for rendering
  const currentSelectValue = formData.categoryId || UNCATEGORIZED_VALUE

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
      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
        <Label htmlFor='description' className='text-right'>
          Description
        </Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          className='col-span-3'
          rows={3}
          aria-invalid={!!getFieldError('description')}
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
          value={formData.frequency}
          onValueChange={handleFrequencyChange}
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

      {/* Category Field */}
      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
        <Label htmlFor='categoryId' className='text-right'>
          Category
        </Label>
        <Select value={currentSelectValue} onValueChange={handleCategoryChange}>
          <SelectTrigger
            id='categoryId'
            className='col-span-3'
            aria-invalid={!!getFieldError('categoryId')}
          >
            <SelectValue placeholder='Select a category (optional)' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNCATEGORIZED_VALUE}>No Category</SelectItem>
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
      {errors?._form && (
        <div className='text-destructive bg-destructive/10 col-span-4 rounded-md p-3 text-sm font-medium'>
          <ul>
            {errors._form.map((error: string, index: number) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
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

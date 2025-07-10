// app/actions/habits.ts

'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Define the shape of the data expected from the form
const HabitSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Habit name cannot be empty.' })
    .max(100, { message: 'Habit name is too long (max 100 characters).' }),
  description: z
    .string()
    .max(500, { message: 'Description is too long (max 500 characters).' })
    .optional(),
  frequency: z.enum(['daily', 'weekly'], {
    required_error: 'Please select a frequency.',
  }),
})

// Define the type for the return value (state of the form)
export type AddHabitFormState = {
  success: boolean
  message?: string | null
  errors?: {
    name?: string[]
    description?: string[]
    frequency?: string[]
    _form?: string[] // For general form errors (like auth issues)
  } | null
}

// --- Helper Functions for Date ---
function getStartOfDayUTC(date: Date): Date {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

// --- Toggle Action Schema and Types ---

// Define input schema for validation (called programmatically)
const ToggleHabitSchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required.'),
  date: z.date({
    required_error: 'Date is required.',
    invalid_type_error: 'Invalid date format.',
  }),
  completed: z.boolean({ required_error: 'Completed state is required.' }),
})

// Define return state type for the toggle action
export type ToggleHabitState = {
  success: boolean
  message?: string | null
  errors?: {
    habitId?: string[]
    date?: string[]
    completed?: string[]
    _form?: string[] // General errors like auth, db, permissions
  } | null
}

/**
 * toggleHabitCompletion Server Action
 *
 * Finds or creates a HabitRecord for a given habit and date, setting its
 * completion status based on the provided 'completed' value.
 * Ensures the habit belongs to the authenticated user.
 *
 * @param habitId The ID of the habit to update.
 * @param date The specific date (will be normalized to start of day UTC).
 * @param completed The new intended completion state (true or false).
 * @returns Promise<ToggleHabitState> Result object indicating success/failure.
 */
export async function toggleHabitCompletion(
  habitId: string,
  date: Date,
  completed: boolean
): Promise<ToggleHabitState> {
  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('User not authenticated.')
    }
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in toggleHabitCompletion:', error)
    return {
      success: false,
      message: 'Authentication Error.',
      errors: { _form: ['User authentication failed.'] },
    }
  }

  // --- 2. Input Validation ---
  const validation = ToggleHabitSchema.safeParse({ habitId, date, completed })

  if (!validation.success) {
    console.error('Validation Error:', validation.error.flatten().fieldErrors)
    return {
      success: false,
      message: 'Invalid input data.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  // Use validated data from here on
  const {
    habitId: validHabitId,
    date: validDate,
    completed: newCompletedState,
  } = validation.data

  // Normalize date to the start of the day in UTC for consistency
  const targetDateStart = getStartOfDayUTC(validDate)

  try {
    // --- 3. Authorization Check ---
    // Verify that the habit being modified actually belongs to the logged-in user.
    const habit = await prisma.habit.findUnique({
      where: {
        id: validHabitId,
        userId: userId, // Ensure the user owns the habit
      },
      select: { id: true }, // We only need to confirm existence and ownership
    })

    // If habit is null, it means either it doesn't exist OR it doesn't belong to this user.
    if (!habit) {
      console.warn(
        `Authorization Failed or Habit Not Found: User ${userId} attempted to toggle habit ${validHabitId}`
      )
      return {
        success: false,
        message: 'Permission Denied or Habit Not Found.',
        errors: {
          _form: [
            'You do not have permission to update this habit, or the habit does not exist.',
          ],
        },
      }
    }

    // --- 4. Database Logic: Upsert HabitRecord ---
    console.log(
      `Upserting HabitRecord: habitId=${validHabitId}, date=${targetDateStart.toISOString()}, completed=${newCompletedState}`
    )

    const updatedRecord = await prisma.habitRecord.upsert({
      where: {
        // Specify the unique index fields
        habitId_date: {
          habitId: validHabitId,
          date: targetDateStart, // Use the normalized UTC start date
        },
      },
      update: {
        // What to update if the record exists
        completed: newCompletedState,
      },
      create: {
        // What to create if the record doesn't exist
        habitId: validHabitId,
        date: targetDateStart, // Use the normalized UTC start date
        completed: newCompletedState,
      },
    })

    console.log(
      `Habit record upserted successfully for habit ${validHabitId} on ${targetDateStart.toISOString()}:`,
      updatedRecord
    )

    // --- 5. Revalidate Cache ---
    revalidatePath('/dashboard')
    console.log(
      `Cache revalidated for /dashboard after toggling habit ${validHabitId}`
    )

    // --- 6. Return Success State ---
    return {
      success: true,
      message: `Habit status updated successfully for ${targetDateStart.toLocaleDateString()}.`,
    }
  } catch (error) {
    console.error('Database/Upsert Error in toggleHabitCompletion:', error)
    return {
      success: false,
      message: 'Database Error: Failed to update habit status.',
      errors: {
        _form: ['An unexpected database error occurred. Please try again.'],
      },
    }
  }
}

/**
 * addHabit Server Action for useFormState
 *
 * Handles the submission of the 'Add New Habit' form with state return.
 * Validates input, checks authentication, creates a new habit record in the database.
 *
 * @param {AddHabitFormState} prevState - Previous form state (required for useFormState)
 * @param {FormData} formData - Data from the form.
 * @returns {Promise<AddHabitFormState>} - Result object for form feedback.
 */
export async function addHabitWithState(
  prevState: AddHabitFormState,
  formData: FormData
): Promise<AddHabitFormState> {
  // --- 1. Get Authenticated User ID ---
  let userId: string | null = null

  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return {
        success: false,
        message: 'Authentication Error: User not logged in.',
        errors: { _form: ['User is not authenticated.'] },
      }
    }

    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in addHabit:', error)
    return {
      success: false,
      message: 'Authentication Error: Failed to retrieve user session.',
      errors: {
        _form: ['An unexpected error occurred during authentication.'],
      },
    }
  }

  // --- 2. Validate Input Data ---
  const formDataEntries = {
    name: formData.get('name'),
    description: formData.get('description'),
    frequency: formData.get('frequency'),
  }

  const validatedFields = HabitSchema.safeParse(formDataEntries)

  if (!validatedFields.success) {
    console.log(
      'Validation Errors:',
      validatedFields.error.flatten().fieldErrors
    )
    return {
      success: false,
      message: 'Validation Failed: Please check the form fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, description, frequency } = validatedFields.data

  // --- 3. Perform Database Operation ---
  try {
    console.log(`Attempting to create habit for userId: ${userId}`)
    console.log(`Data: Name=${name}, Desc=${description}, Freq=${frequency}`)

    await prisma.habit.create({
      data: {
        userId: userId,
        name: name,
        description: description?.trim() ? description.trim() : null,
        frequency: frequency,
      },
    })

    console.log('Habit created successfully in database.')

    // --- 4. Revalidate Cache ---
    revalidatePath('/dashboard')

    // --- 5. Return Success State ---
    return {
      success: true,
      message: `Habit "${name}" added successfully!`,
      errors: null,
    }
  } catch (error) {
    console.error('Database Error: Failed to create habit:', error)
    return {
      success: false,
      message: 'Database Error: Failed to save the new habit.',
      errors: {
        _form: ['An unexpected database error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Basic addHabit Server Action (returns void)
 * For simple form submission without state management
 */
export async function addHabit(formData: FormData): Promise<void> {
  const result = await addHabitWithState(
    { success: false, message: null, errors: null },
    formData
  )

  if (!result.success) {
    throw new Error(result.message || 'Failed to add habit')
  }
}

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
  categoryId: z.string().optional().nullable(), // Optional category
})

// Define the type for the return value (state of the form)
export type AddHabitFormState = {
  success: boolean
  message?: string | null
  errors?: {
    name?: string[]
    description?: string[]
    frequency?: string[]
    categoryId?: string[]
    _form?: string[]
  } | null
}

// --- NEW: Edit Habit Schema and Types ---
const EditHabitSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Habit name cannot be empty.' })
    .max(100, { message: 'Habit name is too long (max 100 characters).' }),
  description: z
    .string()
    .max(500, { message: 'Description is too long (max 500 characters).' })
    .optional()
    .nullable(),
  frequency: z.enum(['daily', 'weekly'], {
    errorMap: () => ({ message: 'Please select a valid frequency.' }),
  }),
  categoryId: z.string().optional().nullable(), // Optional category
})

// Infer type from schema for formData argument
type EditHabitFormData = z.infer<typeof EditHabitSchema>

// Define the type for the edit habit return value
export type EditHabitState = {
  success: boolean
  message?: string | null
  errors?: {
    name?: string[]
    description?: string[]
    frequency?: string[]
    categoryId?: string[]
    habitId?: string[]
    _form?: string[]
  } | null
}

// --- NEW: Delete Habit State Type ---
export type DeleteHabitState = {
  success: boolean
  message?: string | null
  errors?: {
    habitId?: string[]
    _form?: string[] // For general errors (auth, permission, db)
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
 * deleteHabit Server Action
 *
 * Deletes a specified habit and its associated records after performing
 * authentication and authorization checks. Relies on cascading deletes
 * defined in the Prisma schema for removing related HabitRecord entries.
 *
 * @param habitId The ID of the habit to delete.
 * @returns Promise<DeleteHabitState> Result object indicating success/failure.
 */
export async function deleteHabit(habitId: string): Promise<DeleteHabitState> {
  console.log(`Attempting to delete habit ID: ${habitId}`)

  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('User not authenticated.')
    }
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in deleteHabit:', error)
    return {
      success: false,
      message: 'Authentication failed.',
      errors: { _form: ['User authentication failed.'] },
    }
  }

  // --- 2. Validate Habit ID ---
  if (!habitId || typeof habitId !== 'string') {
    console.error('Invalid Habit ID provided for deletion:', habitId)
    return {
      success: false,
      message: 'Invalid Habit ID.',
      errors: { habitId: ['Invalid habit identifier provided.'] },
    }
  }

  try {
    // --- 3. Authorization Check ---
    // Verify the habit exists and belongs to the current user before deleting
    const habit = await prisma.habit.findUnique({
      where: {
        id: habitId,
        userId: userId, // CRUCIAL check
      },
      select: { id: true, name: true }, // Select name for success message
    })

    // If habit is null, it means it doesn't exist OR it doesn't belong to this user
    if (!habit) {
      console.warn(
        `Authorization Failed or Habit Not Found: User ${userId} attempted to delete habit ${habitId}`
      )
      return {
        success: false,
        message: 'Permission Denied or Habit Not Found.',
        errors: {
          _form: [
            'You do not have permission to delete this habit, or it no longer exists.',
          ],
        },
      }
    }

    const habitName = habit.name // Store name for success message
    console.log(
      `Authorization successful for user ${userId} on habit ${habitId} (${habitName}). Proceeding with deletion.`
    )

    // --- 4. Database Deletion ---
    // Use Prisma's delete operation
    // Cascading delete (configured in schema.prisma) should automatically remove related HabitRecord entries
    await prisma.habit.delete({
      where: {
        id: habitId,
      },
    })

    console.log(
      `Habit ${habitId} (${habitName}) and associated records deleted successfully.`
    )

    // --- 5. Revalidate Cache ---
    // Ensure the dashboard UI removes the deleted habit
    revalidatePath('/dashboard')
    console.log(
      `Cache revalidated for /dashboard after deleting habit ${habitId}.`
    )

    // --- 6. Return Success State ---
    return {
      success: true,
      message: `Habit '${habitName}' deleted successfully.`,
    }
  } catch (error) {
    console.error(`Database Error while deleting habit ${habitId}:`, error)
    return {
      success: false,
      message: 'Database Error: Failed to delete habit.',
      errors: {
        _form: [
          'An unexpected error occurred while deleting the habit. Please try again.',
        ],
      },
    }
  }
}

/**
 * editHabit Server Action
 *
 * Updates the details of an existing habit in the database after validation
 * and authorization checks.
 *
 * @param habitId The ID of the habit to update.
 * @param formData The validated form data containing new details.
 * @returns Promise<EditHabitState> Result object indicating success/failure.
 */
export async function editHabit(
  habitId: string,
  formData: EditHabitFormData
): Promise<EditHabitState> {
  console.log(`Attempting to edit habit ID: ${habitId} with data:`, formData)

  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('User not authenticated.')
    }
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in editHabit:', error)
    return {
      success: false,
      message: 'Authentication failed.',
      errors: { _form: ['User authentication failed.'] },
    }
  }

  // --- 2. Validate Habit ID ---
  if (!habitId || typeof habitId !== 'string') {
    console.error('Invalid Habit ID provided:', habitId)
    return {
      success: false,
      message: 'Invalid Habit ID.',
      errors: { habitId: ['Invalid habit identifier provided.'] },
    }
  }

  // --- 3. Validate Form Data ---
  const validation = EditHabitSchema.safeParse(formData)

  if (!validation.success) {
    console.error(
      'Server-side Validation Error in editHabit:',
      validation.error.flatten().fieldErrors
    )
    return {
      success: false,
      message: 'Invalid form data provided.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  // Use validated data from here
  const { name, description, frequency } = validation.data

  try {
    // --- 4. Authorization Check ---
    // Verify that the habit exists AND belongs to the current user.
    const habit = await prisma.habit.findUnique({
      where: {
        id: habitId,
        userId: userId, // CRUCIAL check
      },
      select: { id: true }, // Only need to know if it exists and is owned
    })

    if (!habit) {
      console.warn(
        `Authorization Failed: User ${userId} tried to edit habit ${habitId} they don't own or which doesn't exist.`
      )
      return {
        success: false,
        message: 'Permission Denied or Habit Not Found.',
        errors: {
          _form: [
            'You do not have permission to edit this habit, or it no longer exists.',
          ],
        },
      }
    }

    console.log(
      `Authorization successful for user ${userId} on habit ${habitId}.`
    )

    // --- 5. Database Update ---
    console.log(`Updating habit ${habitId} in database...`)
    await prisma.habit.update({
      where: {
        id: habitId,
      },
      data: {
        name: name,
        description: description || null, // Handle empty strings as null
        frequency: frequency,
        categoryId: validation.data.categoryId || null,
        // Prisma automatically handles `updatedAt` if schema is set up
      },
    })

    console.log(`Habit ${habitId} updated successfully.`)

    // --- 6. Revalidate Cache ---
    revalidatePath('/dashboard')
    console.log(`Cache revalidated for /dashboard.`)

    // --- 7. Return Success State ---
    return {
      success: true,
      message: `Habit '${name}' updated successfully.`,
    }
  } catch (error) {
    console.error(`Database Error while updating habit ${habitId}:`, error)
    return {
      success: false,
      message: 'Database Error: Failed to update habit.',
      errors: {
        _form: [
          'An unexpected error occurred while saving the habit. Please try again.',
        ],
      },
    }
  }
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

    //  NEW: First, ensure the user exists in the database
    await prisma.user.upsert({
      where: {
        id: userId,
      },
      update: {
        // Don't update anything if user exists
      },
      create: {
        id: userId,
        email: `${userId}@clerk.user`, // Fallback email
        name: null,
        emailVerified: null,
        image: null,
      },
    })

    console.log(`User record ensured for userId: ${userId}`)

    // Now create the habit
    await prisma.habit.create({
      data: {
        userId: userId,
        name: name,
        description: description?.trim() ? description.trim() : null,
        frequency: frequency,
        categoryId: validatedFields.data.categoryId || null,
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

const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Category name cannot be empty.' })
    .max(50, { message: 'Category name is too long (max 50 characters).' })
    .trim(),
})

type CreateCategoryFormData = z.infer<typeof CreateCategorySchema>

export type CreateCategoryState = {
  success: boolean
  message?: string | null
  errors?: {
    name?: string[]
    _form?: string[]
  } | null
}

export type DeleteCategoryState = {
  success: boolean
  message?: string | null
  errors?: {
    categoryId?: string[]
    _form?: string[]
  } | null
}

/**
 * createCategory Server Action
 *
 * Creates a new category for the authenticated user
 */
export async function createCategory(
  categoryData: CreateCategoryFormData
): Promise<CreateCategoryState> {
  console.log('Attempting to create category with data:', categoryData)

  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('User not authenticated.')
    }
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in createCategory:', error)
    return {
      success: false,
      message: 'Authentication failed.',
      errors: { _form: ['User authentication failed.'] },
    }
  }

  // --- 2. Validate Input Data ---
  const validation = CreateCategorySchema.safeParse(categoryData)

  if (!validation.success) {
    console.error(
      'Validation Error in createCategory:',
      validation.error.flatten().fieldErrors
    )
    return {
      success: false,
      message: 'Invalid category data provided.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { name } = validation.data

  try {
    // --- 3. Check if category already exists for this user ---
    const existingCategory = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId: userId,
          name: name,
        },
      },
    })

    if (existingCategory) {
      return {
        success: false,
        message: 'Category already exists.',
        errors: { name: ['A category with this name already exists.'] },
      }
    }

    // --- 4. Create Category ---
    const newCategory = await prisma.category.create({
      data: {
        name: name,
        userId: userId,
      },
    })

    console.log(`Category created successfully: ${newCategory.id}`)

    // --- 5. Revalidate Cache ---
    revalidatePath('/dashboard')

    // --- 6. Return Success ---
    return {
      success: true,
      message: `Category "${name}" created successfully.`,
    }
  } catch (error) {
    console.error(`Database Error while creating category:`, error)
    return {
      success: false,
      message: 'Database Error: Failed to create category.',
      errors: {
        _form: ['An unexpected error occurred while creating the category.'],
      },
    }
  }
}

/**
 * deleteCategory Server Action
 *
 * Deletes a category and sets all associated habits to uncategorized
 */
export async function deleteCategory(
  categoryId: string
): Promise<DeleteCategoryState> {
  console.log(`Attempting to delete category ID: ${categoryId}`)

  // --- 1. Authentication ---
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('User not authenticated.')
    }
    userId = clerkUserId
  } catch (error) {
    console.error('Authentication Error in deleteCategory:', error)
    return {
      success: false,
      message: 'Authentication failed.',
      errors: { _form: ['User authentication failed.'] },
    }
  }

  // --- 2. Validate Category ID ---
  if (!categoryId || typeof categoryId !== 'string') {
    console.error('Invalid Category ID provided:', categoryId)
    return {
      success: false,
      message: 'Invalid Category ID.',
      errors: { categoryId: ['Invalid category identifier provided.'] },
    }
  }

  try {
    // --- 3. Authorization Check ---
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        userId: userId, // Ensure user owns the category
      },
      select: { id: true, name: true },
    })

    if (!category) {
      console.warn(
        `Authorization Failed: User ${userId} tried to delete category ${categoryId}`
      )
      return {
        success: false,
        message: 'Permission Denied or Category Not Found.',
        errors: {
          _form: [
            'You do not have permission to delete this category, or it no longer exists.',
          ],
        },
      }
    }

    const categoryName = category.name

    // --- 4. Delete Category ---
    // The onDelete: SetNull in the schema will automatically set categoryId to null for associated habits
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })

    console.log(
      `Category ${categoryId} (${categoryName}) deleted successfully.`
    )

    // --- 5. Revalidate Cache ---
    revalidatePath('/dashboard')

    // --- 6. Return Success ---
    return {
      success: true,
      message: `Category "${categoryName}" deleted successfully.`,
    }
  } catch (error) {
    console.error(
      `Database Error while deleting category ${categoryId}:`,
      error
    )
    return {
      success: false,
      message: 'Database Error: Failed to delete category.',
      errors: {
        _form: ['An unexpected error occurred while deleting the category.'],
      },
    }
  }
}

/**
 * getUserCategories - Helper function to fetch user's categories
 */
export async function getUserCategories() {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const categories = await prisma.category.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            habits: true,
          },
        },
      },
    })

    return categories
  } catch (error) {
    console.error('Error fetching user categories:', error)
    return []
  }
}

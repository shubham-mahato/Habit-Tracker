// src/components/EditHabitDialog.tsx

'use client'

import React, { useState } from 'react'

// Import ShadCN Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Import the form component
import EditHabitForm from './EditHabitForm'

// Import Prisma type for habit prop
import type { Habit, Category } from '@prisma/client'

// Define props
interface EditHabitDialogProps {
  habit: Habit
  categories: Category[] // NEW: Accept categories
  children: React.ReactNode // To wrap the trigger button
}

/**
 * EditHabitDialog Client Component
 *
 * Manages the ShadCN Dialog visibility and renders the EditHabitForm
 * for a specific habit.
 */
export default function EditHabitDialog({
  habit,
  categories,
  children,
}: EditHabitDialogProps) {
  // State to control dialog visibility
  const [isOpen, setIsOpen] = useState(false)

  // Function to close the dialog (can be passed to EditHabitForm)
  const handleCloseDialog = () => {
    setIsOpen(false)
  }

  // Function to handle successful form submission (closes dialog)
  const handleSuccessfulSubmit = () => {
    console.log('Dialog knows edit was successful.')
    handleCloseDialog() // Close the dialog
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* The trigger element (e.g., the Edit button) is passed as children */}
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* The Dialog Content */}
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit '{habit.name}'. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>

        {/* Render the form inside the content area */}
        <EditHabitForm
          habit={habit}
          categories={categories} // NEW: Pass categories to form
          onCancel={handleCloseDialog} // Pass function to allow form's cancel button to work
          onFormSubmit={handleSuccessfulSubmit} // Pass function to close after successful save
        />
      </DialogContent>
    </Dialog>
  )
}

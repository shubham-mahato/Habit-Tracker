// components/AddHabitForm.tsx

import React from 'react'

// 1. Import necessary ShadCN UI components
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

/**
 * AddHabitForm Component
 *
 * Provides the form UI for adding new habits, utilizing ShadCN components.
 * This form will later be connected to a Server Action.
 */
export default function AddHabitForm() {
  // Server Action will be connected via the 'action' prop on the <form> tag later.

  return (
    // The form structure remains largely the same.
    <form className='space-y-6'>
      {' '}
      {/* Increased spacing slightly */}
      {/* --- Habit Name Field --- */}
      <div className='space-y-2'>
        {' '}
        {/* Group label and input */}
        {/* Use ShadCN Label: Links to Input via htmlFor={inputId} */}
        <Label htmlFor='name'>Habit Name</Label>
        {/* Use ShadCN Input: */}
        <Input
          id='name'
          name='name' // CRITICAL: Keep the 'name' attribute for Server Actions
          type='text'
          placeholder='e.g., Drink 8 glasses of water'
          required // Keep basic HTML5 required attribute
          // ShadCN Input applies its own styling.
        />
        {/* Area for potential validation messages */}
      </div>
      {/* --- Habit Description Field (Optional) --- */}
      <div className='space-y-2'>
        {/* Use ShadCN Label */}
        <Label htmlFor='description'>Description (Optional)</Label>
        {/* Use ShadCN Textarea: */}
        <Textarea
          id='description'
          name='description' // CRITICAL: Keep 'name' attribute
          placeholder='e.g., Track daily water intake for better hydration'
          rows={3}
          // ShadCN Textarea applies its own styling.
        />
      </div>
      {/* --- Habit Frequency Field --- */}
      <div className='space-y-2'>
        {/* Use ShadCN Label */}
        <Label htmlFor='frequency'>Frequency</Label>
        {/* Use ShadCN Select Component Group: */}
        <Select name='frequency' required defaultValue='daily'>
          <SelectTrigger id='frequency'>
            {/* Placeholder text when nothing is selected (or for default value) */}
            <SelectValue placeholder='Select frequency' />
          </SelectTrigger>
          <SelectContent>
            {/* Define selectable options */}
            <SelectItem value='daily'>Daily</SelectItem>
            <SelectItem value='weekly'>Weekly</SelectItem>
            {/* Add other frequencies if needed */}
            {/* <SelectItem value="monthly">Monthly</SelectItem> */}
          </SelectContent>
        </Select>
        {/* Adding required directly to Select might not enforce HTML5 validation.
                     Consider adding client-side checks or relying solely on server-side validation.
                     We'll implement robust server-side validation later. */}
      </div>
      {/* --- Submit Button --- */}
      <div className='pt-2'>
        {/* Use ShadCN Button: */}
        <Button type='submit' className='w-full'>
          {' '}
          {/* Make button full width */}
          Add Habit
        </Button>
        {/* Area for pending/loading state indication */}
      </div>
    </form>
  )
}

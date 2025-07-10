// src/components/HeatmapGrid.tsx

// 1. Mark as a Client Component
'use client'

import React from 'react'
// Ensure date-fns is installed: npm install date-fns
import {
  format as formatDate,
  eachDayOfInterval,
  getDay,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isBefore,
} from 'date-fns'

// Import utility for conditional class names if you use it (e.g., from ShadCN)
import { cn } from '@/lib/utils' // Adjust path if needed

// Define the type for the data prop
type ProcessedRecords = Map<string, { completed: boolean }>

// Define the props interface
interface HeatmapGridProps {
  data: ProcessedRecords
  startDate: Date
  endDate: Date // Typically today
}

// Define types for Tailwind color classes based on completion status
type ColorClasses = {
  [level: number]: string // level 0: no data, 1: incomplete, 2: complete
}

// Define color intensity based on completion
// Customize these Tailwind classes to match your theme!
const COMPLETION_COLORS: ColorClasses = {
  0: 'bg-muted/30 hover:bg-muted/50', // No record for the day or before start
  1: 'bg-rose-200 dark:bg-rose-900/40 hover:opacity-80', // Record exists but completed = false
  2: 'bg-emerald-400 dark:bg-emerald-600/70 hover:opacity-80', // Record exists and completed = true
}

// Function to get the completion level for a given date
const getCompletionLevel = (
  date: Date,
  data: ProcessedRecords,
  firstDay: Date
): number => {
  // If the date is before the actual start date of tracking period, treat as level 0
  if (isBefore(date, firstDay)) {
    return 0
  }
  const dateString = formatDate(date, 'yyyy-MM-dd')
  const record = data.get(dateString)
  if (!record) {
    return 0 // No record for this day
  }
  return record.completed ? 2 : 1 // Completed (level 2) or Incomplete (level 1)
}

/**
 * HeatmapGrid Client Component
 *
 * Renders a grid of divs representing a calendar heatmap based on processed data.
 */
export default function HeatmapGrid({
  data,
  startDate,
  endDate,
}: HeatmapGridProps) {
  // 2. Generate all dates within the interval
  const allDates = eachDayOfInterval({ start: startDate, end: endDate })

  // 3. Determine the day of the week for the start date (0=Sun, 1=Mon, ..., 6=Sat)
  // This helps align the first week correctly in the grid.
  const startDayOfWeek = getDay(startDate) // 0 (Sunday) to 6 (Saturday)

  // 4. Create placeholder divs for days before the start date in the first week
  const placeholders = Array.from({ length: startDayOfWeek }, (_, i) => (
    <div
      key={`placeholder-${i}`}
      className='aspect-square h-4 w-4 rounded-[2px]'
    ></div> // Empty div for alignment
  ))

  // 5. Render the grid
  return (
    <div className='flex flex-col gap-1'>
      {/* Optional: Add Day of Week Headers */}
      <div className='text-muted-foreground grid grid-cols-7 gap-1 text-xs'>
        <div className='text-center'>Sun</div>
        <div className='text-center'>Mon</div>
        <div className='text-center'>Tue</div>
        <div className='text-center'>Wed</div>
        <div className='text-center'>Thu</div>
        <div className='text-center'>Fri</div>
        <div className='text-center'>Sat</div>
      </div>

      {/* The main heatmap grid */}
      <div className='grid grid-cols-7 gap-1'>
        {/* Render placeholders first */}
        {placeholders}

        {/* Render actual date cells */}
        {allDates.map((date) => {
          const completionLevel = getCompletionLevel(date, data, startDate)
          const colorClass = COMPLETION_COLORS[completionLevel]
          const dateString = formatDate(date, 'PPP') // Format for tooltip e.g., "Jan 1st, 2024"

          return (
            <div
              key={formatDate(date, 'yyyy-MM-dd')}
              className={cn(
                'aspect-square h-4 w-4 rounded-[2px] transition-colors duration-150 ease-in-out', // Base styles
                colorClass // Apply color based on completion
              )}
              // Basic tooltip showing date and status
              title={`${dateString}: ${
                completionLevel === 2
                  ? 'Completed'
                  : completionLevel === 1
                    ? 'Incomplete'
                    : 'No record'
              }`}
            >
              {/* Screen reader text for accessibility */}
              <span className='sr-only'>
                {dateString}:{' '}
                {completionLevel === 2
                  ? 'Completed'
                  : completionLevel === 1
                    ? 'Incomplete'
                    : 'No record'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

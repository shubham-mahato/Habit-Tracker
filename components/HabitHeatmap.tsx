// src/components/HabitHeatmap.tsx

import React from 'react'
import { prisma } from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { startOfDay, subDays, format as formatDate } from 'date-fns'

// 1. Import the new HeatmapGrid component
import HeatmapGrid from './HeatMapGrid' // Adjust path if necessary

// Helper Function for Date (Ensure defined or imported)
function getStartOfDayUTC(date: Date): Date {
  /* ... */
}

// Props interface
interface HabitHeatmapProps {
  habitId: string
  habitName: string
  days?: number
}

// Processed data type (Map<string, { completed: boolean }>)
type ProcessedRecords = Map<string, { completed: boolean }>

export default async function HabitHeatmap({
  habitId,
  habitName,
  days = 90, // Default lookback period
}: HabitHeatmapProps) {
  // --- 1. Define Time Range ---
  const endDate = getStartOfDayUTC(new Date())
  const startDate = getStartOfDayUTC(subDays(endDate, days - 1))

  // --- 2. Data Fetching ---
  let records: { id: string; date: Date; completed: boolean }[] = []
  try {
    records = await prisma.habitRecord.findMany({
      /* ... query ... */
    })
  } catch (error) {
    // ... Error handling returns error card ...
    return (
      <Card className='border-destructive bg-destructive/10 mt-4'>
        {/* Error Card */}
      </Card>
    )
  }

  // --- 3. Process Data for Visualization ---
  const processedData: ProcessedRecords = new Map()
  records.forEach((record) => {
    const dateString = formatDate(record.date, 'yyyy-MM-dd')
    processedData.set(dateString, { completed: record.completed })
  })

  console.log(
    `HabitHeatmap: Processed ${processedData.size} records for ${habitName}`
  )

  // --- 4. Render the Card and the HeatmapGrid ---
  return (
    <Card className='bg-background/50 mt-4'>
      <CardHeader>
        <CardTitle className='text-lg'>{habitName} - Progress</CardTitle>
        <CardDescription>
          Last {days} days overview
          {/* Optional: Show date range */}
          {/* (${formatDate(startDate, 'MMM d')} - ${formatDate(endDate, 'MMM d, yyyy')}) */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Replace the placeholder div with the HeatmapGrid component */}
        {/* Pass the processed data and date range as props */}
        <HeatmapGrid
          data={processedData}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Optional: Add a Legend */}
        <div className='text-muted-foreground mt-3 flex items-center justify-end gap-2 text-xs'>
          <span>Less</span>
          <div
            className={`h-3 w-3 rounded-[2px] ${COMPLETION_COLORS[0]}`}
          ></div>
          <div
            className={`h-3 w-3 rounded-[2px] ${COMPLETION_COLORS[1]}`}
          ></div>
          <div
            className={`h-3 w-3 rounded-[2px] ${COMPLETION_COLORS[2]}`}
          ></div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Make sure COMPLETION_COLORS is accessible here if used in legend
// (or duplicate it / import from shared location)
const COMPLETION_COLORS: { [level: number]: string } = {
  0: 'bg-muted/30',
  1: 'bg-rose-200 dark:bg-rose-900/40',
  2: 'bg-emerald-400 dark:bg-emerald-600/70',
}

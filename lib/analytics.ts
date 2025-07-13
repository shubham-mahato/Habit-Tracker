// src/lib/analytics.ts (or lib/analytics.ts)

// Import needed types
import type { HabitRecord } from '@prisma/client'

/**
 * Helper function to get the date part (day, month, year) in UTC.
 * This ignores the time component and avoids timezone issues for daily comparisons.
 * @param date The input Date object.
 * @returns A new Date object set to midnight UTC for that day.
 */
function getUTCDate(date: Date): Date {
  // Ensure input is a valid date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to getUTCDate:', date)
    return new Date(NaN)
  }
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

/**
 * Calculates the completion percentage for a habit within a given date range.
 * It counts the number of unique days within the range the habit was marked complete.
 *
 * @param habitRecords An array of HabitRecord objects (or objects with `date` and `completed`).
 *                     Assumes records are for a single habit. Sorting is not strictly necessary.
 * @param startDate The start date of the period (inclusive), expected to be normalized to UTC midnight.
 * @param endDate The end date of the period (inclusive), expected to be normalized to UTC midnight.
 * @returns The completion percentage (an integer between 0 and 100),
 *          or 0 if the period is invalid or no records exist.
 */
export function calculateCompletionPercentage(
  // Use Pick to define the minimal required shape of records
  habitRecords: Pick<HabitRecord, 'date' | 'completed'>[],
  startDate: Date,
  endDate: Date
): number {
  // --- Input Validation ---
  // Check for valid date objects and period
  if (
    !habitRecords ||
    !(startDate instanceof Date) ||
    isNaN(startDate.getTime()) ||
    !(endDate instanceof Date) ||
    isNaN(endDate.getTime()) ||
    startDate.getTime() > endDate.getTime()
  ) {
    console.warn('Invalid input to calculateCompletionPercentage:', {
      habitRecords,
      startDate,
      endDate,
    })
    return 0
  }

  // --- Calculate Total Days in Period ---
  // Calculate the time difference in milliseconds
  const diffTime = endDate.getTime() - startDate.getTime()
  // Calculate the total number of days (add 1 for inclusive range)
  const totalDaysInPeriod = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1

  // Check for invalid period calculation (should not happen with valid dates)
  if (totalDaysInPeriod <= 0) {
    console.warn('Invalid period duration calculated:', {
      startDate,
      endDate,
      totalDaysInPeriod,
    })
    return 0
  }

  // --- Count Completed Days within Period ---
  // Use a Set to store the timestamps (representing unique UTC days)
  // where the habit was completed within the range.
  const uniqueCompletedDays = new Set<number>()

  for (const record of habitRecords) {
    // Ensure record.date is valid before processing
    if (!(record.date instanceof Date) || isNaN(record.date.getTime())) {
      console.warn('Skipping invalid date in habit record:', record)
      continue // Skip this record
    }

    const recordDateUTC = getUTCDate(record.date)
    const recordTime = recordDateUTC.getTime() // Get time value for Set storage

    // Check if the record date falls within the period [startDate, endDate]
    if (recordTime >= startDate.getTime() && recordTime <= endDate.getTime()) {
      // Check if the habit was completed on this day
      if (record.completed) {
        // Add the unique UTC day timestamp to the Set
        uniqueCompletedDays.add(recordTime)
      }
    }
  }

  // The size of the Set gives the count of unique completed days within the period
  const completedCount = uniqueCompletedDays.size

  // --- Calculate Percentage ---
  const percentage = (completedCount / totalDaysInPeriod) * 100

  // Return the percentage, rounded to the nearest integer
  return Math.round(percentage)
}

// Also export the helper if needed elsewhere
export { getUTCDate }

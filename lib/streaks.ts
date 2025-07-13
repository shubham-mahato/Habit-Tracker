// src/lib/streaks.ts (or lib/streaks.ts)

import type { HabitRecord } from '@prisma/client'

/**
 * Helper function to get the date part (day, month, year) in UTC.
 * This ignores the time component and avoids timezone issues for daily comparisons.
 * @param date The input Date object.
 * @returns A new Date object set to midnight UTC for that day.
 */
function getUTCDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

/**
 * Helper function to get today's date part (midnight UTC).
 * @returns A new Date object representing today at midnight UTC.
 */
function getTodayUTC(): Date {
  return getUTCDate(new Date()) // Use current date
}

/**
 * Helper function to check if two UTC dates are exactly one day apart.
 * Assumes input dates are already normalized to midnight UTC.
 * @param date1 First date (UTC midnight).
 * @param date2 Second date (UTC midnight).
 * @returns True if the dates represent consecutive days, false otherwise.
 */
function areDatesConsecutive(date1: Date, date2: Date): boolean {
  // Calculate the difference in time (milliseconds)
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  // Calculate the difference in days
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) // ms * sec * min * hr
  return diffDays === 1
}

// Define the structure for the result
export interface StreakResult {
  currentStreak: number
  longestStreak: number
}

/**
 * Calculates the current and longest streaks for a habit based on its records.
 *
 * IMPORTANT ASSUMPTIONS:
 * 1. `habitRecords` contains records ONLY for the specific habit being analyzed.
 * 2. `habitRecords` should ideally be pre-sorted chronologically (ascending date)
 *    by the caller (e.g., Prisma query `orderBy: { date: 'asc' }`).
 *    The function includes a sort as a fallback, but pre-sorting is more efficient.
 * 3. Dates in `habitRecords` (`date` field) represent the day the habit was tracked.
 *    Consistency in timezone handling during data saving (using UTC Date is recommended) is crucial.
 *
 * @param habitRecords An array of HabitRecord objects (or objects with `date` and `completed` fields).
 * @returns An object containing `currentStreak` and `longestStreak`.
 */
export function calculateStreaks(
  // Use Pick to specify we only need these fields, enhancing reusability
  habitRecords: Pick<HabitRecord, 'date' | 'completed'>[]
): StreakResult {
  // --- Initial Checks ---
  if (!habitRecords || habitRecords.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // --- Data Preparation ---
  // 1. Filter for completed records only.
  // 2. Normalize dates to UTC midnight for consistent comparison.
  // 3. Sort chronologically (ascending) as a safety measure.
  const completedDates = habitRecords
    .filter((record) => record.completed)
    .map((record) => getUTCDate(record.date)) // Normalize date to UTC day
    .sort((a, b) => a.getTime() - b.getTime()) // Ensure ascending order (fixed bug from guide)

  // If no completed records exist after filtering
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // --- Calculate Longest Streak ---
  let longestStreak = 0
  let currentRun = 0
  let previousDate: Date | null = null

  for (const currentDate of completedDates) {
    if (previousDate && areDatesConsecutive(previousDate, currentDate)) {
      // The current date continues the streak from the previous date
      currentRun++
    } else if (
      !previousDate ||
      currentDate.getTime() !== previousDate.getTime()
    ) {
      // Start a new streak (either the first record, or a non-consecutive date,
      // or not the same date as the previous one - handles potential duplicates)
      currentRun = 1
    }
    // If currentDate is the same as previousDate, currentRun doesn't change.

    // Update longest streak if the current run is longer
    if (currentRun > longestStreak) {
      longestStreak = currentRun
    }

    // Store the current date for the next iteration
    previousDate = currentDate
  }

  // --- Calculate Current Streak ---
  let currentStreak = 0
  const today = getTodayUTC()
  const yesterday = getUTCDate(new Date(Date.now() - 86400000)) // Get yesterday UTC midnight

  // Check if the *very last* completed date is today or yesterday.
  // If not, the current streak is definitely 0.
  const lastCompletedDate = completedDates[completedDates.length - 1]

  if (
    lastCompletedDate.getTime() === today.getTime() ||
    lastCompletedDate.getTime() === yesterday.getTime()
  ) {
    // A potential current streak exists, count backwards from the last completed date.
    currentStreak = 1 // Start with the last completed date itself
    let dateToFind = getUTCDate(
      new Date(lastCompletedDate.getTime() - 86400000)
    ) // Day before last completed

    // Iterate backwards through the *rest* of the completed dates
    for (let i = completedDates.length - 2; i >= 0; i--) {
      const recordDate = completedDates[i]

      if (recordDate.getTime() === dateToFind.getTime()) {
        // Found the consecutive preceding day
        currentStreak++
        // Set the next date to look for (the day before this one)
        dateToFind = getUTCDate(new Date(recordDate.getTime() - 86400000))
      } else {
        // The streak is broken before this record, stop counting backwards.
        // This handles gaps: if recordDate is older than dateToFind.
        break
      }
    }
  } else {
    // The last completed date is older than yesterday, so the current streak is 0.
    currentStreak = 0
  }

  // --- Return Results ---
  return { currentStreak, longestStreak }
}

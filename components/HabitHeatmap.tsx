// components/HabitHeatmap.tsx - Simple Placeholder

import React from 'react'

interface HabitHeatmapProps {
  habitId: string
  habitName: string
}

/**
 * HabitHeatmap Component - Simple Placeholder
 *
 * Shows a basic progress indicator instead of a complex heatmap
 * Can be enhanced later with actual heatmap functionality
 */
export default function HabitHeatmap({
  habitId,
  habitName,
}: HabitHeatmapProps) {
  return (
    <div className='w-full'>
      {/* Simple progress placeholder */}
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-muted-foreground text-xs'>Progress</span>
        <span className='text-muted-foreground text-xs'>Coming Soon</span>
      </div>

      {/* Visual grid placeholder */}
      <div className='grid grid-cols-7 gap-1'>
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className='bg-muted h-3 w-3 rounded-sm'
            title={`Day ${i + 1}`}
          />
        ))}
      </div>

      {/* Helper text */}
      <p className='text-muted-foreground mt-2 text-xs'>
        Visual progress tracking coming soon
      </p>
    </div>
  )
}

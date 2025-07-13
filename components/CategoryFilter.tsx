// src/components/CategoryFilter.tsx

'use client' // Mark as Client Component for hooks and interactivity

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation' // Hooks for URL manipulation

// Import ShadCN Select component parts
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label' // Optional Label for the select

// Import Category type from Prisma
import type { Category } from '@prisma/client'

// Define props
interface CategoryFilterProps {
  categories: Category[] // List of available categories for the user
  // No need to pass current filter value explicitly, we'll read it from URL
}

const ALL_CATEGORIES_VALUE = 'all-categories' // Use non-empty string to represent "All Categories"

/**
 * CategoryFilter Client Component
 *
 * Renders a Select dropdown to filter habits by category.
 * Updates URL search parameters on selection change.
 */
export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter() // Hook to perform navigation/URL updates
  const pathname = usePathname() // Hook to get the current URL path (e.g., /dashboard)
  const searchParams = useSearchParams() // Hook to read current URL search parameters

  // Get the current category filter value from the URL ('category' parameter)
  const currentCategory = searchParams.get('category') ?? ALL_CATEGORIES_VALUE

  // Handler for when the select value changes
  const handleValueChange = (categoryId: string) => {
    // Create a new URLSearchParams object based on the current ones
    const params = new URLSearchParams(searchParams.toString())

    // Update the 'category' parameter
    if (categoryId === ALL_CATEGORIES_VALUE) {
      // If "All Categories" is selected, remove the parameter
      params.delete('category')
    } else {
      // Otherwise, set the parameter to the selected categoryId
      params.set('category', categoryId)
    }

    // Perform navigation to update the URL without full page reload
    // This will trigger Next.js to re-render the page with new searchParams
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    // { scroll: false } prevents scrolling to the top of the page on navigation
  }

  return (
    <div className='flex w-full max-w-xs flex-col gap-1.5'>
      {' '}
      {/* Adjust width as needed */}
      <Label htmlFor='category-filter' className='text-sm font-medium'>
        Filter by Category
      </Label>
      <Select
        value={currentCategory} // Controlled component based on URL param
        onValueChange={handleValueChange} // Function to call on change
      >
        <SelectTrigger id='category-filter' className='w-full'>
          {/* Placeholder reflects the current selection */}
          <SelectValue placeholder='Select category...' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            {/* "All Categories" Option */}
            <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
            {/* Map over user's categories */}
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

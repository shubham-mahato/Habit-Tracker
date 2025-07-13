// src/components/CategoryManagement.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { Category } from '@prisma/client'

// Import ShadCN components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Loader2, FolderOpen } from 'lucide-react'

// Import Server Actions (these already exist in your habits.ts file)
import { createCategory, deleteCategory } from '@/app/actions/habits'

interface CategoryManagementProps {
  categories: Category[]
}

/**
 * CategoryManagement Client Component
 *
 * Allows users to create and delete categories using existing Server Actions
 */
export default function CategoryManagement({
  categories,
}: CategoryManagementProps) {
  const [isPending, startTransition] = useTransition()
  const [newCategoryName, setNewCategoryName] = useState('')

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    startTransition(async () => {
      try {
        // Use the existing Server Action from your habits.ts
        const result = await createCategory({ name: newCategoryName.trim() })

        if (result.success) {
          toast.success(result.message || 'Category created successfully!')
          setNewCategoryName('')
        } else {
          toast.error(result.message || 'Failed to create category')
          // Handle specific field errors
          if (result.errors?.name) {
            toast.error(result.errors.name.join(', '))
          }
          if (result.errors?._form) {
            toast.error(result.errors._form.join(', '))
          }
        }
      } catch (error) {
        console.error('Error creating category:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    startTransition(async () => {
      try {
        // Use the existing Server Action from your habits.ts
        const result = await deleteCategory(categoryId)

        if (result.success) {
          toast.success(result.message || 'Category deleted successfully!')
        } else {
          toast.error(result.message || 'Failed to delete category')
          if (result.errors?._form) {
            toast.error(result.errors._form.join(', '))
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FolderOpen className='h-5 w-5' />
          Manage Categories
        </CardTitle>
        <CardDescription>
          Create and organize your habit categories
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Create Category Form */}
        <form onSubmit={handleCreateCategory} className='flex gap-2'>
          <div className='flex-1'>
            <Label htmlFor='categoryName' className='sr-only'>
              Category Name
            </Label>
            <Input
              id='categoryName'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder='Enter category name (e.g., Health, Work, Personal)'
              disabled={isPending}
              maxLength={50}
            />
          </div>
          <Button type='submit' disabled={isPending || !newCategoryName.trim()}>
            {isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <>
                <Plus className='mr-2 h-4 w-4' />
                Add
              </>
            )}
          </Button>
        </form>

        {/* Categories List */}
        {categories.length > 0 ? (
          <div className='space-y-2'>
            <h4 className='text-muted-foreground text-sm font-medium'>
              Your Categories ({categories.length})
            </h4>
            <div className='grid gap-2'>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className='bg-muted/30 flex items-center justify-between rounded-md border p-2'
                >
                  <span className='text-sm font-medium'>{category.name}</span>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        disabled={isPending}
                        className='text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0'
                        title={`Delete category "${category.name}"`}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the category "
                          {category.name}"? This action cannot be undone. Habits
                          in this category will become uncategorized.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          disabled={isPending}
                          className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                          {isPending ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Deleting...
                            </>
                          ) : (
                            'Delete'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-muted-foreground py-4 text-center'>
            <FolderOpen className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              No categories yet. Create your first category above!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

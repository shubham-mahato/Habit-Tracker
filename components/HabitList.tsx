// components/HabitList.tsx (using Clerk)

import React from 'react';
import { auth } from '@clerk/nextjs/server'; // Clerk server-side helper
import { prisma } from '@/lib/prisma'; // Your Prisma client instance
import Link from 'next/link';

// ShadCN UI Components for the card layout
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button'; // For potential "Add Habit" prompt

// Define the Habit type based on your Prisma model
type Habit = {
    id: string;
    name: string;
    description: string | null;
    frequency: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * HabitList - A Server Component to fetch and display habits.
 *
 * This component runs entirely on the server. It fetches authentication
 * state using Clerk's `auth()` helper and then queries the database
 * for habits associated with the logged-in user using Prisma.
 */
export default async function HabitList() {
    // 1. Get authentication state directly on the server.
    const { userId } = await auth();

    // 2. If no userId is found, the user is not authenticated.
    // Although the dashboard page might also check, it's robust
    // to ensure components relying on auth also verify.
    // In a real scenario, middleware should prevent this component
    // from rendering if the user isn't logged in on a protected route.
    // We can return null or an error message, but returning null is cleaner
    // if the parent page handles the main auth redirect.
    if (!userId) {
        console.warn("HabitList rendered without userId. Check route protection.");
        // Optionally, return a message or component indicating an error/auth issue
        // return <p>Error: User not authenticated.</p>;
        return null; // Or handle as appropriate for your UI flow
    }

    // 3. Fetch habits for the logged-in user from the database.
    let habits: Habit[] = [];
    try {
        habits = await prisma.habit.findMany({
            where: {
                userId: userId, // Filter by the Clerk user ID stored in your Habit table
            },
            orderBy: {
                createdAt: 'desc', // Display newest habits first, or choose another order
            },
        });
    } catch (error) {
        console.error("Failed to fetch habits:", error);
        // Render an error state if the database query fails
        return (
            <Card className="mt-4 bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Database Error</CardTitle>
                    <CardDescription className="text-destructive">
                        Could not load your habits. Please try again later.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // 4. Handle the case where the user has no habits yet.
    if (habits.length === 0) {
        return (
            <Card className="mt-4 shadow-none border-dashed">
                <CardHeader className="items-center text-center">
                    <CardTitle>No Habits Yet!</CardTitle>
                    <CardDescription>
                        You haven't added any habits to track. Get started!
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {/* Optionally provide a button/link to add the first habit */}
                    {/* This would link to the page/modal you create later for adding habits */}
                    {/* <Button asChild>
                        <Link href="/habits/add">Add Your First Habit</Link>
                    </Button> */}
                     <p className="text-sm text-muted-foreground">(Add habit button/link coming soon)</p>
                </CardContent>
            </Card>
        );
    }

    // 5. Render the list of habits using the Card-based grid layout.
    return (
        // Grid container - `gap-4` provides space between cards.
        // `mt-4` adds margin above the grid.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {habits.map((habit: Habit) => (
                // Card itself:
                // - `flex flex-col`: Stacks header, content, footer vertically.
                // - `bg-card`: Ensures consistent background based on theme.
                // - `overflow-hidden`: Prevents content overflow issues (good practice).
                // - `transition-all duration-150 ease-in-out`: Base for hover effects.
                // - `hover:shadow-md hover:border-primary/30`: Subtle hover effect.
                <Card
                  key={habit.id}
                  className="flex flex-col bg-card overflow-hidden transition-all duration-150 ease-in-out hover:shadow-md hover:border-primary/30"
                >
                    {/* Card Header: Default ShadCN padding is usually sufficient. */}
                    <CardHeader>
                        {/* Title: `text-lg` provides good size, `font-semibold` adds emphasis. */}
                        {/* `truncate` prevents long titles from breaking layout. */}
                        <CardTitle className="text-lg font-semibold truncate">{habit.name}</CardTitle>
                        {/* Description: `text-sm` keeps it smaller than the title. */}
                        <CardDescription className="text-sm">
                            Frequency: {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                        </CardDescription>
                    </CardHeader>

                    {/* Card Content: */}
                    {/* - `flex-grow`: Pushes footer down. */}
                    {/* - `flex flex-col justify-between`: Ensures content fills space vertically and pushes placeholder down. */}
                    <CardContent className="flex-grow flex flex-col justify-between">
                        {/* Description Paragraph: */}
                        {/* - `text-sm`: Standard text size. */}
                        {/* - `text-muted-foreground`: Softer color for less emphasis. */}
                        {/* - `mb-4`: Margin below the description if it exists. */}
                        {habit.description ? (
                            <p className="text-sm text-muted-foreground mb-4">
                                {habit.description}
                            </p>
                        ) : (
                            // Ensure some space if no description exists
                            <div className="mb-4"></div>
                        )}

                        {/* Tracking Placeholder Wrapper: */}
                        {/* - `mt-auto`: Pushes this block towards the bottom of CardContent. */}
                        {/* - `pt-4`: Adds padding above the placeholder box. */}
                        <div className="mt-auto pt-4">
                            {/* Placeholder Box: */}
                            {/* - `h-10`, `border`, `rounded`, `flex`, `items-center`, `justify-center`: Basic styling. */}
                            {/* - `text-xs`, `text-muted-foreground`: Small, subtle text. */}
                            {/* - `bg-muted/30`: Slightly different background. */}
                            <div className="h-10 border rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/30">
                                (Tracking UI Placeholder)
                            </div>
                        </div>
                    </CardContent>

                    {/* Card Footer: */}
                    {/* - `flex`, `justify-between`, `items-center`: Arranges items horizontally. */}
                    {/* - `text-xs`, `text-muted-foreground`: Small, subtle text. */}
                    {/* - `pt-4`: Padding above the footer content. */}
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                        <div>(Actions Placeholder)</div>
                        <div>(Streak Placeholder)</div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
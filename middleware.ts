// middleware.ts 

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/habits(.*)',
  '/settings(.*)',
  // Add more protected routes here
])

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that match the protected route matcher
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
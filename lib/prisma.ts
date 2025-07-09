import { PrismaClient } from '@prisma/client'

// Declare a global variable to hold the PrismaClient instance.
// We use 'var' here to ensure it's treated as a global variable accessible via 'globalThis'.
// TypeScript requires declaring global modifications using 'declare global'.
declare global {
  var prisma: PrismaClient | undefined
}

// Instantiate PrismaClient.
// In development, check if an instance already exists on the global object.
// If it does, reuse the existing instance to prevent creating multiple connections during hot-reloads.
// If it doesn't, create a new instance and store it on the global object.
// In production, always create a new instance (as the code runs only once).
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // Optional: Add logging configuration here if needed during development
    // log: ['query', 'info', 'warn', 'error'],
  })

// If we are in a development environment, assign the newly created prisma instance
// to the global variable. This ensures it's available for reuse on subsequent hot-reloads.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Export the single 'prisma' instance to be used throughout the application.
// Note: Some documentation might export a function `getClient()` instead.
// Exporting the instance directly is simpler and generally sufficient.
// Default export is not used here to allow named imports like `import { prisma } from '...'`.

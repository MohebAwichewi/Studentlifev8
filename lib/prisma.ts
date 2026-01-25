import { PrismaClient } from '@prisma/client'

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!')
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production')
  }
}

console.log('🔧 [PRISMA] Initializing Prisma Client...')

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['error', 'warn', 'query']
    : ['error'],
})



if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
else console.log('✅ [PRISMA] Production Prisma instance loaded')
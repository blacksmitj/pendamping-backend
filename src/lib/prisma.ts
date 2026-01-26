import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export { Prisma } from '../../generated/prisma/client'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

// Defensive check to ensure we have the expected models
if (prisma && !(prisma as any).universities) {
    console.error("CRITICAL: Prisma Client is missing 'universities' model. Please run 'npx prisma generate'.")
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
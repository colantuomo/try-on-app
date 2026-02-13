import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient }

const globalForPrisma = globalThis as PrismaGlobal
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

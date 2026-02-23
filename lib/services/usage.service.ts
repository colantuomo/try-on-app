import prisma from '@/db/client'

type CreditAvailability = {
  readonly canGenerate: boolean
}

export type UsageSummary = {
  readonly plan: string
  readonly creditsRemaining: number
  readonly monthlyLimit: number
  readonly monthlyUsed: number
}

const getActiveCreditPacks = async (userId: string) => {
  const now = new Date()
  const packs = await prisma.creditPack.findMany({
    where: {
      userId,
      expiresAt: { gt: now },
    },
    orderBy: { expiresAt: 'asc' },
  })

  return packs.filter((pack) => pack.creditsUsed < pack.creditsTotal)
}

const sumActiveCreditPacks = async (userId: string): Promise<number> => {
  const packs = await getActiveCreditPacks(userId)
  return packs.reduce((total, pack) => total + (pack.creditsTotal - pack.creditsUsed), 0)
}

export const canUserGenerateImage = async (userId: string): Promise<CreditAvailability> => {
  const usage = await prisma.usage.findUnique({
    where: { userId },
  })

  if (usage) {
    const monthlyRemaining = Math.max(0, usage.monthlyLimit - usage.monthlyUsed)
    if (monthlyRemaining > 0) {
      return { canGenerate: true }
    }
  }

  const packs = await getActiveCreditPacks(userId)
  return { canGenerate: packs.length > 0 }
}

export const getUsageSummary = async (userId: string): Promise<UsageSummary | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      usage: true,
    },
  })

  if (!user) {
    return null
  }

  const monthlyLimit = user.usage?.monthlyLimit ?? 0
  const monthlyUsed = user.usage?.monthlyUsed ?? 0
  const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed)
  const packRemaining = await sumActiveCreditPacks(userId)

  return {
    plan: user.plan,
    creditsRemaining: monthlyRemaining + packRemaining,
    monthlyLimit,
    monthlyUsed,
  }
}

export const debitOneCredit = async (userId: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const usage = await tx.usage.findUnique({
      where: { userId },
    })

    if (usage) {
      const monthlyRemaining = Math.max(0, usage.monthlyLimit - usage.monthlyUsed)
      if (monthlyRemaining > 0) {
        await tx.usage.update({
          where: { userId },
          data: { monthlyUsed: { increment: 1 } },
        })
        return
      }
    }

    const now = new Date()
    const packs = await tx.creditPack.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    })

    const pack = packs.find((item) => item.creditsUsed < item.creditsTotal)
    if (!pack) {
      throw new Error('No credits available')
    }

    await tx.creditPack.update({
      where: { id: pack.id },
      data: { creditsUsed: { increment: 1 } },
    })
  })
}

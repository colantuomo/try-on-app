import Stripe from 'stripe'
import { env } from '@/lib/config/env'
import prisma from '@/db/client'

// Singleton Stripe client
export const stripe = new Stripe(env.stripeSecretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
})

export type PlanType = 'TRIAL'
export type CreditPackSize = 10 | 30 | 50 | 100
export type PricingCurrency = 'usd' | 'brl'

interface CreateCheckoutSessionParams {
    userId: string
    userEmail: string
    plan: PlanType
}

interface CreateCreditPackSessionParams {
    userId: string
    userEmail: string
    packSize: CreditPackSize
    currency: PricingCurrency
}

const PLAN_PRICES = {
    TRIAL: 1490, // R$ 14,90 em centavos de USD (conversão aproximada)
} as const

const PLAN_NAMES = {
    TRIAL: 'Plano Trial - 10 Imagens',
} as const

const CREDIT_PACK_PRICES: Record<CreditPackSize, Record<PricingCurrency, number>> = {
    10: { usd: 990, brl: 990 },
    30: { usd: 2400, brl: 2400 },
    50: { usd: 3900, brl: 3900 },
    100: { usd: 6900, brl: 6900 },
} as const

const CREDIT_PACK_NAMES: Record<CreditPackSize, string> = {
    10: 'Pacote de 10 creditos',
    30: 'Pacote de 30 creditos',
    50: 'Pacote de 50 creditos',
    100: 'Pacote de 100 creditos',
}

export const getCreditPackSizeFromAmount = (
    amount: number,
    currency: PricingCurrency
): CreditPackSize | null => {
    const entries = Object.entries(CREDIT_PACK_PRICES) as Array<
        [string, Record<PricingCurrency, number>]
    >

    for (const [size, priceMap] of entries) {
        if (priceMap[currency] === amount) {
            return Number(size) as CreditPackSize
        }
    }

    return null
}

/**
 * Cria uma sessão de checkout do Stripe para compra única
 */
export async function createCheckoutSession({
    userId,
    userEmail,
    plan,
}: CreateCheckoutSessionParams): Promise<string> {
    const trialMetadata = {
        userId,
        plan,
        purchaseType: 'TRIAL',
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment', // Pagamento único (não recorrente)
        payment_method_types: ['card'],
        client_reference_id: userId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: PLAN_NAMES[plan],
                        description: 'Créditos para geração de imagens virtuais',
                    },
                    unit_amount: PLAN_PRICES[plan],
                },
                quantity: 1,
            },
        ],
        metadata: trialMetadata,
        payment_intent_data: {
            metadata: trialMetadata,
        },
        customer_email: userEmail,
        success_url: `${env.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.baseUrl}/pricing`,
    })

    if (!session.url) {
        throw new Error('Failed to create Stripe checkout session')
    }

    return session.url
}

export async function createCreditPackCheckoutSession({
    userId,
    userEmail,
    packSize,
    currency,
}: CreateCreditPackSessionParams): Promise<string> {
    const creditPackMetadata = {
        userId,
        purchaseType: 'CREDIT_PACK',
        packSize: String(packSize),
        currency,
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        client_reference_id: userId,
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: CREDIT_PACK_NAMES[packSize],
                        description: 'Creditos para geracao de imagens virtuais',
                    },
                    unit_amount: CREDIT_PACK_PRICES[packSize][currency],
                },
                quantity: 1,
            },
        ],
        metadata: creditPackMetadata,
        payment_intent_data: {
            metadata: creditPackMetadata,
        },
        customer_email: userEmail,
        success_url: `${env.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.baseUrl}/pricing`,
    })

    if (!session.url) {
        throw new Error('Failed to create Stripe checkout session')
    }

    return session.url
}

/**
 * Ativa o plano TRIAL após pagamento confirmado
 */
export async function activateTrialPlan(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { plan: 'TRIAL' },
    })

    const existingUsage = await prisma.usage.findUnique({
        where: { userId },
    })

    if (!existingUsage) {
        await prisma.usage.create({
            data: {
                userId,
                periodStart: new Date(),
                periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
                monthlyLimit: 10,
                monthlyUsed: 0,
            },
        })
        return
    }

    await prisma.usage.update({
        where: { userId },
        data: {
            monthlyLimit: existingUsage.monthlyLimit + 10,
        },
    })
}

export async function addCreditPackToUser(
    userId: string,
    creditsTotal: CreditPackSize
): Promise<void> {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    console.log('adding new credit to user');
    
    await prisma.creditPack.create({
        data: {
            userId,
            creditsTotal,
            creditsUsed: 0,
            expiresAt,
        },
    })
}

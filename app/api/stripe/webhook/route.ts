import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/services/stripe.service'
import {
    activateTrialPlan,
    addCreditPackToUser,
    getCreditPackSizeFromAmount,
    type PricingCurrency,
} from '@/lib/services/stripe.service'
import { env } from '@/lib/config/env'

export async function POST(req: NextRequest) {
    console.log('[Stripe Webhook] Received request')
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('[Stripe Webhook] Received event with body:', signature)
    if (!signature) {
        console.error('[Stripe Webhook] Missing stripe-signature header')
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 }
        )
    }

    let event: Stripe.Event

    try {
        // Verify webhook signature
        if (!env.stripeWebhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET not configured')
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.stripeWebhookSecret
        )
    } catch (error) {
        console.error('[Stripe Webhook] Signature verification failed:', error)
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        )
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                const resolveMetadata = async () => {
                    let metadata = session.metadata ?? {}

                    if (!metadata.purchaseType && typeof session.payment_intent === 'string') {
                        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
                        metadata = { ...metadata, ...paymentIntent.metadata }
                    }

                    return metadata
                }

                const metadata = await resolveMetadata()
                const userId = metadata.userId ?? session.client_reference_id ?? undefined
                const purchaseType = metadata.purchaseType
                const plan = metadata.plan
                const packSize = metadata.packSize
                const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : null
                const sessionCurrency = typeof session.currency === 'string' ? session.currency.toLowerCase() : null
                const inferredPackSize =
                    !purchaseType && !packSize && amountTotal && sessionCurrency
                        ? getCreditPackSizeFromAmount(amountTotal, sessionCurrency as PricingCurrency)
                        : null

                // Verify payment was successful
                if (session.payment_status === 'paid') {
                    const effectivePurchaseType = purchaseType ?? (inferredPackSize ? 'CREDIT_PACK' : undefined)
                    const effectivePackSize = packSize ?? (inferredPackSize ? String(inferredPackSize) : undefined)

                    if (!userId || !effectivePurchaseType) {
                        console.error('[Stripe Webhook] Missing metadata:', { userId, purchaseType })
                        return NextResponse.json(
                            { error: 'Invalid metadata' },
                            { status: 400 }
                        )
                    }

                    if (effectivePurchaseType === 'TRIAL' && plan === 'TRIAL') {
                        console.log(`[Stripe Webhook] Activating TRIAL plan for user ${userId}`)
                        await activateTrialPlan(userId)
                        console.log(`[Stripe Webhook] TRIAL plan activated for user ${userId}`)
                    } else if (effectivePurchaseType === 'CREDIT_PACK') {
                        const normalizedSize = Number(effectivePackSize ?? inferredPackSize)
                        if (![10, 30, 50, 100].includes(normalizedSize)) {
                            console.error('[Stripe Webhook] Invalid pack size:', effectivePackSize)
                            return NextResponse.json(
                                { error: 'Invalid pack size' },
                                { status: 400 }
                            )
                        }

                        await addCreditPackToUser(userId, normalizedSize as 10 | 30 | 50 | 100)
                        console.log(`[Stripe Webhook] Credit pack added for user ${userId}`)
                    } else {
                        console.warn('[Stripe Webhook] Unknown purchase type:', purchaseType)
                    }
                } else {
                    console.warn(`[Stripe Webhook] Payment not paid: ${session.payment_status}`)
                }

                break
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error) {
        console.error('[Stripe Webhook] Error processing event:', error)

        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

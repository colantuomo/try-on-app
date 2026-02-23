import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import {
  createCheckoutSession,
  createCreditPackCheckoutSession,
  type CreditPackSize,
  type PricingCurrency,
} from '@/lib/services/stripe.service'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const body = await req.json()
    const { plan, purchaseType, packSize, currency } = body

    let checkoutUrl = ''

    console.log(body);
    
    if (plan === 'TRIAL' && purchaseType !== 'CREDIT_PACK') {
      checkoutUrl = await createCheckoutSession({
        userId: session.user.id,
        userEmail: session.user.email,
        plan: 'TRIAL',
      })
    } else if (purchaseType === 'CREDIT_PACK') {
      console.log('Creating credit pack checkout session with:', { packSize, currency });
      const allowedSizes: CreditPackSize[] = [10, 30, 50, 100]
      const normalizedSize = Number(packSize) as CreditPackSize
      const normalizedCurrency = String(currency || '').toLowerCase() as PricingCurrency

      if (!allowedSizes.includes(normalizedSize)) {
        return NextResponse.json(
          { error: 'Pacote inválido' },
          { status: 400 }
        )
      }

      if (normalizedCurrency !== 'usd' && normalizedCurrency !== 'brl') {
        return NextResponse.json(
          { error: 'Moeda inválida' },
          { status: 400 }
        )
      }

      checkoutUrl = await createCreditPackCheckoutSession({
        userId: session.user.id,
        userEmail: session.user.email,
        packSize: normalizedSize,
        currency: normalizedCurrency,
      })
    } else {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // 4. Return checkout URL
    return NextResponse.json({ url: checkoutUrl }, { status: 200 })
  } catch (error) {
    console.error('[Stripe Checkout] Error creating session:', error)
    
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'motion/react'

type Currency = 'usd' | 'brl'

type Plan = {
  id: string
  name: string
  priceUsd: number
  priceBrl: number
  description: string
}

type CreditPack = {
  size: 10 | 30 | 50 | 100
  priceUsd: number
  priceBrl: number
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Plano Básico',
    priceUsd: 5.0,
    priceBrl: 5.0,
    description: 'Perfeito para começar',
  },
]

const CREDIT_PACKS: CreditPack[] = [
  { size: 10, priceUsd: 9.9, priceBrl: 9.9 },
  { size: 30, priceUsd: 24, priceBrl: 24 },
  { size: 50, priceUsd: 39, priceBrl: 39 },
  { size: 100, priceUsd: 69, priceBrl: 69 },
]

const getCurrencyFromLocale = () => {
  if (typeof window === 'undefined') return 'usd' as Currency
  const locale = navigator.language || ''
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const isBrazil = locale.toLowerCase().includes('pt-br') || timeZone.includes('America/Sao_Paulo')
  return isBrazil ? 'brl' : 'usd'
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('usd')
  const [isLoadingPack, setIsLoadingPack] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrency(getCurrencyFromLocale())
  }, [])

  const locale = currency === 'brl' ? 'pt-BR' : 'en-US'
  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    })
  }, [currency, locale])

  const handleCheckout = async (packSize: CreditPack['size']) => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    try {
      setError(null)
      setIsLoadingPack(packSize)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'CREDIT_PACK',
          packSize,
          currency,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erro ao criar sessao de checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (checkoutError) {
      console.error('[Pricing] Checkout error:', checkoutError)
      setError('Nao foi possivel iniciar o pagamento. Tente novamente.')
      setIsLoadingPack(null)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)] px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-10 shadow-xl shadow-slate-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute -left-20 bottom-6 h-56 w-56 rounded-full bg-amber-100/60 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Planos de credito
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold text-slate-900">
                  Escolha o pacote ideal
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-600">
                  Valores exibidos em {currency === 'brl' ? 'BRL' : 'USD'} de acordo com sua localidade.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/studio"
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ir para o studio
                </Link>
                {status !== 'authenticated' && (
                  <Link
                    href="/login"
                    className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {CREDIT_PACKS.map((pack) => {
                const price = currency === 'brl' ? pack.priceBrl : pack.priceUsd
                return (
                  <motion.div
                    key={pack.size}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Pacote</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
                          {pack.size} imagens
                        </h2>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Mais popular
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Preco por imagem
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatter.format(price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckout(pack.size)}
                      disabled={isLoadingPack === pack.size}
                      className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoadingPack === pack.size ? 'Processando...' : 'Comprar agora'}
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {error && (
              <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Pagamentos processados pelo Stripe.</span>
              <span>Credito valido por 12 meses.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

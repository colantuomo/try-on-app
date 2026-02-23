import { Suspense } from 'react'
import Link from 'next/link'

function SuccessContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Confirmado!
        </h1>

        <p className="text-gray-600 mb-8">
          Seu pagamento foi confirmado com sucesso.
          <br />
          Seus creditos foram adicionados a sua conta.
        </p>

        <div className="space-y-3">
          <Link
            href="/studio"
            className="block w-full rounded-full bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ir para o studio
          </Link>

          <Link
            href="/pricing"
            className="block w-full rounded-full border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Carregando...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}

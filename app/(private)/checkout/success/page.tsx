import { Suspense } from 'react'
import Link from 'next/link'

function SuccessContent() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-10 h-44 w-44 rounded-full bg-amber-100/60 blur-3xl" />

          <div className="relative">
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  className="h-8 w-8 text-emerald-600"
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

            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pagamento</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">
              Confirmado
            </h1>

            <p className="mt-4 text-sm text-slate-600">
              Seus creditos foram adicionados com sucesso. Continue criando novas provas visuais.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                href="/studio"
                className="block w-full rounded-full bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-200/60 hover:bg-blue-700"
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

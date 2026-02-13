'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
            <span className="text-xl font-bold text-slate-900">DressMe</span>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Ir para o Painel
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Experimente Roupas
              <span className="text-indigo-600"> Virtualmente</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Use inteligência artificial para ver como qualquer roupa fica em você. Faça upload de uma foto sua e de uma peça de roupa, e veja o resultado instantaneamente.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {session ? (
                <Link
                  href="/try-on"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Começar a Experimentar
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Começar Gratuitamente
                </Link>
              )}
              <Link
                href="/pricing"
                className="text-base font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors"
              >
                Ver Planos <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-24 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50">
                <div className="h-12 w-12 rounded-lg bg-indigo-600 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">IA Avançada</h3>
                <p className="mt-2 text-slate-600">
                  Tecnologia de ponta para resultados realistas e de alta qualidade.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50">
                <div className="h-12 w-12 rounded-lg bg-indigo-600 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Upload Fácil</h3>
                <p className="mt-2 text-slate-600">
                  Faça upload de fotos ou use URLs. Suporte para múltiplos formatos.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50">
                <div className="h-12 w-12 rounded-lg bg-indigo-600 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Resultados Instantâneos</h3>
                <p className="mt-2 text-slate-600">
                  Veja o resultado em segundos. Salve e compartilhe suas criações.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mx-auto mt-24 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pronto para Experimentar?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Junte-se a milhares de usuários que já descobriram o futuro do shopping virtual.
            </p>
            <div className="mt-10">
              {session ? (
                <Link
                  href="/try-on"
                  className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Começar Agora
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Criar Conta Gratuita
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-indigo-600"></div>
              <span className="font-semibold text-slate-900">DressMe</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2024 DressMe. Experimente roupas virtualmente com IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
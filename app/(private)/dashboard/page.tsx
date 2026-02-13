'use client'

import { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [router, status])

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <p className="text-sm text-slate-600">Carregando...</p>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Seu painel</h1>
            <p className="mt-2 text-sm text-slate-600">
              Bem-vindo, {session.user?.name ?? session.user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Atalhos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use os links abaixo para voltar ao try-on ou conferir o seu historico.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/try-on"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Gerar nova imagem
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

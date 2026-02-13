'use client'

import { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [router, status])

  const handleSignIn = () => {
    void signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use sua conta Google para acessar o painel e acompanhar suas geracoes.
        </p>

        <button
          type="button"
          onClick={handleSignIn}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          disabled={status === 'loading' || Boolean(session)}
        >
          {status === 'loading' ? 'Carregando...' : 'Continuar com Google'}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Voltar para a pagina inicial
        </Link>
      </div>
    </main>
  )
}

'use client'

import { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/studio')
    }
  }, [router, status])

  const handleSignIn = () => {
    void signIn('google', { callbackUrl: '/studio' })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Try On Studio</p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-slate-900">Entrar</h1>
          <p className="mt-3 text-sm text-slate-600">
            Acesse sua conta com Google para criar provas visuais e acompanhar seus creditos.
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-6 w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 hover:bg-blue-700"
            disabled={status === 'loading' || Boolean(session)}
          >
            {status === 'loading' ? 'Carregando...' : 'Continuar com Google'}
          </button>

          <Link
            href="/"
            className="mt-5 block text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700"
          >
            Voltar para a pagina inicial
          </Link>
        </motion.div>
      </div>
    </main>
  )
}

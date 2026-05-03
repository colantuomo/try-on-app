'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'motion/react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)]">
      <header className="relative z-10 px-6 py-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">
              TO
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Try On</p>
              <p className="text-sm font-semibold text-slate-900">Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Planos
            </Link>
            {session ? (
              <Link
                href="/studio"
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Studio
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-blue-200/60 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
          className="pointer-events-none absolute -left-28 bottom-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
        />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-14 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2">
              <span className="text-xs font-semibold text-blue-700">Em Beta — Evoluindo continuamente</span>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-slate-500">IA fashion lab</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
              Try On
              <span className="text-blue-600"> cria provas</span>
              <br />
              visuais com elegancia
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              Transforme seu look em segundos. Envie uma foto e uma roupa, e veja a
              combinacao pronta para vitrine. Sem esforco, com realismo.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {session ? (
                <Link
                  href="/studio"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 hover:bg-blue-700"
                >
                  Comecar agora
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 hover:bg-blue-700"
                >
                  Criar conta
                </Link>
              )}
              <Link
                href="/pricing"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver precos
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            className="relative w-full max-w-md"
          >
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Arte viva
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-blue-50" />
                <div className="h-28 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-slate-100" />
              </div>
              <p className="mt-6 text-sm text-slate-600">
                Combine textura, caimento e cor com uma paleta minimalista e foco na elegancia.
              </p>
            </div>
          </motion.div>
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                title: 'Detalhe realista',
                description: 'Texturas e cortes com acabamento de catalogo.',
              },
              {
                title: 'Fluxo rapido',
                description: 'Carregue imagens e receba a prova em segundos.',
              },
              {
                title: 'Estetica premium',
                description: 'Resultados consistentes para vitrines digitais.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60"
              >
                <h3 className="font-display text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  )
}
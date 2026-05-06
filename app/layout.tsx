import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/provider'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Itaú - Prova Visual',
  description: 'Tecnologia de prova visual do Itaú. Envie sua foto e uma peça de roupa para ver como fica em você usando IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fraunces.variable} ${manrope.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

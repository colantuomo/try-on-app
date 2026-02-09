import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Virtual Try-On App',
  description: 'Upload your photo and clothing to see how it looks on you using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 text-slate-900">
        {children}
      </body>
    </html>
  )
}

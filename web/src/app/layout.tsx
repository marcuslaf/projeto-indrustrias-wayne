import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SiteBackground } from '@/components/site-background'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Indústrias Wayne - Gestão de Recursos',
  description: 'Sistema de gerenciamento de recursos e segurança da Wayne Enterprises',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}>
        <SiteBackground />
        <div className="relative bg-zinc-950 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}

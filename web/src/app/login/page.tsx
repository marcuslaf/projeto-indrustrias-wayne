'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster, toast } from 'sonner'

function WayneLogo() {
  return (
    <svg viewBox="0 0 120 120" className="h-20 w-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="20" y1="20" x2="100" y2="100">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="112" height="112" rx="28" stroke="url(#logo-grad)" strokeWidth="2.5" />
      <rect x="14" y="14" width="92" height="92" rx="22" stroke="url(#logo-grad)" strokeWidth="1" strokeOpacity="0.35" />
      <path
        d="M28 40 L40 85 L60 55 L80 85 L92 40"
        stroke="url(#logo-grad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="60" r="34" stroke="url(#logo-grad)" strokeWidth="0.5" strokeOpacity="0.25" />
    </svg>
  )
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${username}@wayne.internal`,
      password,
    })

    if (signInError || !user) {
      toast.error('Credenciais inválidas. Verifique seu usuário e senha.')
      setLoading(false)
      return
    }

    toast.success('Login bem-sucedido!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/gotham-bg.jpg')] bg-cover bg-center opacity-[0.12] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-zinc-950" />
      <div
        className="absolute bottom-0 left-0 right-0 h-64 opacity-[0.06]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 60% at 10% 100%, rgba(168,85,247,0.8) 0%, transparent 50%),
            radial-gradient(ellipse 100% 40% at 30% 100%, rgba(139,92,246,0.6) 0%, transparent 50%),
            radial-gradient(ellipse 100% 50% at 50% 100%, rgba(99,102,241,0.4) 0%, transparent 50%),
            radial-gradient(ellipse 100% 40% at 70% 100%, rgba(139,92,246,0.6) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 90% 100%, rgba(168,85,247,0.8) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/5 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/3 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/3 blur-3xl" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center opacity-[0.03] pointer-events-none select-none">
        <svg viewBox="0 0 1000 120" className="w-[800px] h-[110px]" fill="currentColor" color="white">
          <text x="500" y="80" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="sans-serif" letterSpacing="14">INDÚSTRIAS WAYNE</text>
        </svg>
      </div>
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), rgba(99,102,241,0.3), transparent)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/20 to-transparent" />
      <Card className="relative w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border-zinc-800/40 shadow-2xl shadow-purple-900/15">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4">
            <WayneLogo />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Indústrias Wayne
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Sistema de Segurança e Gestão de Recursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Usuário</Label>
              <Input
                id="username"
                placeholder="admin, gerente, funcionario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 transition-all"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster richColors />
    </div>
  )
}

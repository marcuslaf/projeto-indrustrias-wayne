'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster, toast } from 'sonner'

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/10">
            <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-zinc-100">Indústrias Wayne</CardTitle>
          <CardDescription className="text-zinc-400">
            Faça login para acessar o sistema de segurança e recursos.
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
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
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
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-xs text-zinc-500 text-center mt-4">
              Credenciais padrão: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
      <Toaster richColors />
    </div>
  )
}

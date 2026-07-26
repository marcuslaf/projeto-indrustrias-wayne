'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase-client'
import { logAccess } from '@/lib/audit-log'
import { User, Save, Loader2, KeyRound } from 'lucide-react'

const roleLabel: Record<string, string> = {
  funcionario: 'Funcionário',
  gerente: 'Gerente',
  admin_seguranca: 'Admin de Segurança',
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (p) {
        setProfile(p)
        setNome((p as any).nome ?? '')
      }
    }
    load()
  }, [])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { toast.error('Nome não pode ficar vazio.'); return }
    setLoading(true)
    const { error } = await (supabase.from('profiles') as any).update({ nome: nome.trim() }).eq('id', user.id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Perfil atualizado com sucesso!')
    logAccess('Perfil: Editar nome')
    setLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('A nova senha deve ter no mínimo 6 caracteres.'); return }
    if (newPassword !== confirmPassword) { toast.error('As senhas não conferem.'); return }
    setChangingPassword(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })
    if (signInError) { toast.error('Senha atual incorreta.'); setChangingPassword(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { toast.error(error.message); setChangingPassword(false); return }

    toast.success('Senha alterada com sucesso!')
    logAccess('Perfil: Alterar senha')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangingPassword(false)
  }

  const userRole = user?.user_metadata?.role ?? 'funcionario'

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-[url('/gotham-bg.jpg')] bg-cover bg-center opacity-[0.12] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-transparent pointer-events-none" />
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-3xl px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Meu Perfil</h1>
          <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais e senha.</p>
        </div>

        <Card className="mb-6 bg-zinc-900/10 border-zinc-700/30">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Usuário</Label>
                  <Input value={profile?.username ?? ''} disabled className="bg-zinc-800/50 border-zinc-700 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Papel</Label>
                  <div>
                    <Badge className="mt-1.5">{roleLabel[userRole] ?? userRole}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-zinc-300">Nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input value={user?.email ?? ''} disabled className="bg-zinc-800/50 border-zinc-700 text-zinc-500" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/10 border-zinc-700/30">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Senha Atual</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Nova Senha</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Confirmar Nova Senha</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
              </div>
              <Button type="submit" disabled={changingPassword} variant="outline" className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Alterar Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster richColors />
    </div>
  )
}

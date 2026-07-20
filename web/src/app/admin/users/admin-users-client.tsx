'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Toaster, toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import { Trash2, UserPlus, Loader2 } from 'lucide-react'

interface ProfileItem {
  id: string
  username: string
  role: string
  nome: string
  email: string | null
}

interface AdminUsersClientProps {
  profiles: ProfileItem[]
  userRole: string
}

const roleOptions = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'admin_seguranca', label: 'Admin de Segurança' },
]

export function AdminUsersClient({ profiles: initialProfiles, userRole }: AdminUsersClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<ProfileItem[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', nome: '', email: '', role: '' })

  if (userRole !== 'admin_seguranca') {
    return (
      <div className="relative min-h-screen bg-zinc-950">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168,85,247,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center opacity-[0.03] pointer-events-none select-none">
          <svg viewBox="0 0 1000 120" className="w-[800px] h-[110px]" fill="currentColor" color="white">
            <text x="500" y="80" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="sans-serif" letterSpacing="14">INDÚSTRIAS WAYNE</text>
          </svg>
        </div>
        <Navbar userRole={userRole} />
        <main className="relative mx-auto max-w-7xl px-4 py-8 pt-20">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-400">Você não tem permissão para acessar esta página.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  function resetForm() {
    setForm({ username: '', password: '', nome: '', email: '', role: '' })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username || !form.password || !form.nome || !form.role) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: `${form.username}@wayne.internal`,
      password: form.password,
      options: {
        data: {
          username: form.username,
          role: form.role,
          nome: form.nome,
        },
      },
    })

    if (signUpError) {
      toast.error(signUpError.message)
      setLoading(false)
      return
    }

    toast.success('Usuário criado com sucesso!')
    resetForm()
    router.refresh()
    setLoading(false)
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`Tem certeza que deseja excluir "${username}"?`)) return

    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Erro ao excluir usuário')
      return
    }
    toast.success('Usuário excluído!')
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center opacity-[0.03] pointer-events-none select-none">
        <svg viewBox="0 0 1000 120" className="w-[800px] h-[110px]" fill="currentColor" color="white">
          <text x="500" y="80" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="sans-serif" letterSpacing="14">INDÚSTRIAS WAYNE</text>
        </svg>
      </div>
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-7xl px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Gestão de Usuários</h1>
          <p className="text-zinc-400 mt-1">Administre os usuários do sistema.</p>
        </div>

        <Card className="mb-8 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-500" />
              Criar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-zinc-300">Usuário</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Papel</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? '' })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {roleOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Senha</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Email (opcional)</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Usuário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Usuário</TableHead>
                  <TableHead className="text-zinc-400">Nome</TableHead>
                  <TableHead className="text-zinc-400">Papel</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400 w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-100">{p.username}</TableCell>
                    <TableCell className="text-zinc-300">{p.nome}</TableCell>
                    <TableCell>
                      <Badge>{roleOptions.find(r => r.value === p.role)?.label ?? p.role}</Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{p.email ?? '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id, p.username)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Toaster richColors />
    </div>
  )
}

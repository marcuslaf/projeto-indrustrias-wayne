'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toaster, toast } from 'sonner'
import { createClient } from '@/lib/supabase-client'
import {
  Package, ArrowLeft, Save, Loader2, Calendar, MapPin, Wrench, Barcode,
} from 'lucide-react'

const typeLabel: Record<string, string> = {
  equipamento: 'Equipamento',
  veiculo: 'Veículo',
  dispositivo_seguranca: 'Dispositivo de Segurança',
}

const statusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  em_uso: 'Em Uso',
  em_manutencao: 'Em Manutenção',
}

const typeOptions = [
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'veiculo', label: 'Veículo' },
  { value: 'dispositivo_seguranca', label: 'Dispositivo de Segurança' },
]

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_uso', label: 'Em Uso' },
  { value: 'em_manutencao', label: 'Em Manutenção' },
]

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userRole, setUserRole] = useState('funcionario')
  const [resource, setResource] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '', type: '', serial_number: '', plate: '',
    location: '', status: '', acquisition_date: '', last_maintenance_date: '',
  })

  const id = Number(params.id)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserRole(user.user_metadata?.role ?? 'funcionario')

      const { data } = await supabase.from('resources').select('*').eq('id', id).is('deleted_at', null).single()
      if (!data) { router.push('/resources'); return }
      const r = data as any
      setResource(r)
      setForm({
        name: r.name, type: r.type, serial_number: r.serial_number ?? '',
        plate: r.plate ?? '', location: r.location, status: r.status,
        acquisition_date: r.acquisition_date, last_maintenance_date: r.last_maintenance_date ?? '',
      })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, type: form.type, serial_number: form.serial_number || null,
      plate: form.plate || null, location: form.location, status: form.status,
      acquisition_date: form.acquisition_date, last_maintenance_date: form.last_maintenance_date || null,
    }
    const { error } = await supabase.from('resources').update(payload as any).eq('id', id)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Recurso atualizado!')
    setResource({ ...resource, ...payload })
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  if (!resource) return null

  const canManage = userRole === 'admin_seguranca' || userRole === 'gerente'

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
        <Button variant="ghost" onClick={() => router.push('/resources')} className="mb-6 text-zinc-400 hover:text-zinc-100 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Recursos
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Package className="h-6 w-6 text-purple-500" />
              {resource.name}
            </h1>
            <p className="text-zinc-400 mt-1">
              {typeLabel[resource.type] ?? resource.type} • {resource.location}
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setEditing(!editing)}
              variant="outline"
              className="border-zinc-700 text-zinc-300"
            >
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="bg-zinc-900/10 border-zinc-700/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {statusOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="text-base px-3 py-1">
                  {statusLabel[resource.status] ?? resource.status}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/10 border-zinc-700/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {typeOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-zinc-100 font-medium">{typeLabel[resource.type] ?? resource.type}</span>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/10 border-zinc-700/30">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Detalhes do Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Nome</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Localização</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Nº Série</Label>
                    <Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Placa</Label>
                    <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Data de Aquisição</Label>
                    <Input type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Última Manutenção</Label>
                    <Input type="date" value={form.last_maintenance_date} onChange={(e) => setForm({ ...form, last_maintenance_date: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </form>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-500 text-xs">Nome</Label>
                    <p className="text-zinc-100 mt-0.5">{resource.name}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Localização</Label>
                    <p className="text-zinc-100 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {resource.location}
                    </p>
                  </div>
                  {resource.serial_number && (
                    <div>
                      <Label className="text-zinc-500 text-xs">Nº de Série</Label>
                      <p className="text-zinc-100 mt-0.5 flex items-center gap-1">
                        <Barcode className="h-3.5 w-3.5 text-zinc-500" />
                        {resource.serial_number}
                      </p>
                    </div>
                  )}
                  {resource.plate && (
                    <div>
                      <Label className="text-zinc-500 text-xs">Placa</Label>
                      <p className="text-zinc-100 mt-0.5">{resource.plate}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-500 text-xs">Data de Aquisição</Label>
                    <p className="text-zinc-100 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {new Date(resource.acquisition_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Última Manutenção</Label>
                    <p className="text-zinc-100 mt-0.5 flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5 text-zinc-500" />
                      {resource.last_maintenance_date
                        ? new Date(resource.last_maintenance_date).toLocaleDateString('pt-BR')
                        : 'Nenhuma registro'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Criado em</Label>
                    <p className="text-zinc-100 mt-0.5">{new Date(resource.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster richColors />
    </div>
  )
}

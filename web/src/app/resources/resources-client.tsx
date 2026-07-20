'use client'

import { useState, useEffect } from 'react'
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
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Resource, ResourceType, ResourceStatus } from '@/db/schema'

interface ResourcesClientProps {
  resources: Resource[]
  userRole: string
}

const typeOptions: { value: ResourceType; label: string }[] = [
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'veiculo', label: 'Veículo' },
  { value: 'dispositivo_seguranca', label: 'Dispositivo de Segurança' },
]

const statusOptions: { value: ResourceStatus; label: string }[] = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_uso', label: 'Em Uso' },
  { value: 'em_manutencao', label: 'Em Manutenção' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  disponivel: 'default',
  em_uso: 'secondary',
  em_manutencao: 'destructive',
}

const typeLabel: Record<string, string> = {
  equipamento: 'Equipamento',
  veiculo: 'Veículo',
  dispositivo_seguranca: 'Disp. Segurança',
}

const canManage = (role: string) => role === 'admin_seguranca' || role === 'gerente'
const canDelete = (role: string) => role === 'admin_seguranca'

export function ResourcesClient({ resources: initialResources, userRole }: ResourcesClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    type: '' as ResourceType | '',
    serial_number: '',
    plate: '',
    location: '',
    status: '' as ResourceStatus | '',
    acquisition_date: '',
    last_maintenance_date: '',
  })

  const filtered = resources.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() {
    setForm({ name: '', type: '', serial_number: '', plate: '', location: '', status: '', acquisition_date: '', last_maintenance_date: '' })
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.type || !form.location || !form.status || !form.acquisition_date) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)

    const payload = {
      name: form.name,
      type: form.type as ResourceType,
      serial_number: form.serial_number || null,
      plate: form.plate || null,
      location: form.location,
      status: form.status as ResourceStatus,
      acquisition_date: form.acquisition_date,
      last_maintenance_date: form.last_maintenance_date || null,
    }

    if (editingId) {
      const { error } = await (supabase.from('resources') as any)
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Recurso atualizado com sucesso!')
    } else {
      const { error } = await (supabase.from('resources') as any)
        .insert(payload)

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Recurso criado com sucesso!')
    }

    resetForm()
    const { data } = await (supabase.from('resources') as any).select('*').is('deleted_at', null).order('created_at', { ascending: false })
    if (data) setResources(data as Resource[])
    setLoading(false)
  }

  function startEdit(resource: Resource) {
    setEditingId(resource.id)
    setForm({
      name: resource.name,
      type: resource.type,
      serial_number: resource.serial_number ?? '',
      plate: resource.plate ?? '',
      location: resource.location,
      status: resource.status,
      acquisition_date: resource.acquisition_date,
      last_maintenance_date: resource.last_maintenance_date ?? '',
    })
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) return
    const { error } = await (supabase.from('resources') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Recurso excluído com sucesso!')
    setResources((prev) => prev.filter((r) => r.id !== id))
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
        <svg viewBox="0 0 600 120" className="w-[700px] h-[140px]" fill="currentColor" color="white">
          <text x="300" y="80" textAnchor="middle" fontSize="64" fontWeight="900" fontFamily="sans-serif" letterSpacing="12">INDÚSTRIAS WAYNE</text>
        </svg>
      </div>
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Gestão de Recursos</h1>
          <p className="text-zinc-400 mt-1">
            Gerencie equipamentos, veículos e dispositivos de segurança.
          </p>
        </div>

        {canManage(userRole) && (
          <Card className="mb-8 bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">
                {editingId ? 'Editar Recurso' : 'Adicionar Recurso'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Nome</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ResourceType })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      {typeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-zinc-300">Localização</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ResourceStatus })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial_number" className="text-zinc-300">Nº Série (opcional)</Label>
                  <Input id="serial_number" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate" className="text-zinc-300">Placa (opcional)</Label>
                  <Input id="plate" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisition_date" className="text-zinc-300">Data de Aquisição</Label>
                  <Input id="acquisition_date" type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_maintenance_date" className="text-zinc-300">Última Manutenção</Label>
                  <Input id="last_maintenance_date" type="date" value={form.last_maintenance_date} onChange={(e) => setForm({ ...form, last_maintenance_date: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? 'Salvar Alterações' : 'Adicionar Recurso'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="border-zinc-700 text-zinc-300">
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar recursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Nome</TableHead>
                  <TableHead className="text-zinc-400">Tipo</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Localização</TableHead>
                  <TableHead className="text-zinc-400 w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                      Nenhum recurso encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((resource) => (
                    <TableRow key={resource.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-zinc-100">{resource.name}</TableCell>
                      <TableCell className="text-zinc-300">{typeLabel[resource.type]}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[resource.status]}>
                          {statusOptions.find(s => s.value === resource.status)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{resource.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {canManage(userRole) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(resource)}
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(userRole) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(resource.id)}
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Toaster richColors />
    </div>
  )
}

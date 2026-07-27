'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase-client'
import { logAccess } from '@/lib/audit-log'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { PageSkeleton } from '@/components/page-skeleton'
import { downloadCSV } from '@/lib/csv'
import { Search, Pencil, Trash2, Loader2, ExternalLink, Download } from 'lucide-react'
import { z } from 'zod'
import type { Resource, ResourceType, ResourceStatus } from '@/db/schema'

const resourceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['equipamento', 'veiculo', 'dispositivo_seguranca']),
  serial_number: z.string().nullable().optional(),
  plate: z.string().nullable().optional(),
  location: z.string().min(1, 'Localização é obrigatória'),
  status: z.enum(['disponivel', 'em_uso', 'em_manutencao']),
  acquisition_date: z.string().min(1, 'Data de aquisição é obrigatória'),
  last_maintenance_date: z.string().nullable().optional(),
})

interface ResourcesClientProps {
  resources: Resource[]
  userRole: string
  defaultType?: Resource['type']
  defaultStatus?: Resource['status']
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

export function ResourcesClient({ resources: initialResources, userRole, defaultType, defaultStatus }: ResourcesClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [pageLoading, setPageLoading] = useState(initialResources.length === 0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>(defaultType ?? 'all')
  const [filterStatus, setFilterStatus] = useState<string>(defaultStatus ?? 'all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const { confirm: confirmDelete, dialog: confirmDialog } = useConfirmDialog()

  useEffect(() => {
    if (initialResources.length === 0) {
      supabase.from('resources').select('*').is('deleted_at', null).order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setResources(data as Resource[])
          setPageLoading(false)
        })
    }
  }, [])

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

  const chips = [
    { id: 'all', label: 'Todos', icon: null, type: 'all', status: 'all', color: 'text-zinc-400', border: 'border-zinc-700' },
    { id: 'equipamento_em_uso', label: 'Equip. em Uso', icon: null, type: 'equipamento', status: 'em_uso', color: 'text-blue-400', border: 'border-blue-700/50' },
    { id: 'veiculo_em_uso', label: 'Veículos em Operação', icon: null, type: 'veiculo', status: 'em_uso', color: 'text-emerald-400', border: 'border-emerald-700/50' },
    { id: 'dispositivo_seguranca_em_uso', label: 'Disp. Segurança', icon: null, type: 'dispositivo_seguranca', status: 'em_uso', color: 'text-purple-400', border: 'border-purple-700/50' },
    { id: 'em_manutencao', label: 'Em Manutenção', icon: null, type: 'all', status: 'em_manutencao', color: 'text-amber-400', border: 'border-amber-700/50' },
  ] as const

  const chipCounts = chips.map((chip) => ({
    ...chip,
    count: resources.filter((r) => {
      if (chip.type !== 'all' && r.type !== chip.type) return false
      if (chip.status !== 'all' && r.status !== chip.status) return false
      return true
    }).length,
  }))

  const activeChip = chips.find(
    (c) => (c.type === filterType || (c.type === 'all' && filterType === 'all')) &&
           (c.status === filterStatus || (c.status === 'all' && filterStatus === 'all'))
  ) ?? chips[0]

  const filtered = resources.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.type.toLowerCase().includes(search.toLowerCase()) &&
        !r.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function resetForm() {
    setForm({ name: '', type: '', serial_number: '', plate: '', location: '', status: '', acquisition_date: '', last_maintenance_date: '' })
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const parsed = resourceSchema.safeParse({
      name: form.name,
      type: form.type || undefined,
      serial_number: form.serial_number || null,
      plate: form.plate || null,
      location: form.location,
      status: form.status || undefined,
      acquisition_date: form.acquisition_date,
      last_maintenance_date: form.last_maintenance_date || null,
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos'
      toast.error(firstError)
      setLoading(false)
      return
    }

    const payload = parsed.data

    if (editingId) {
      const { error } = await supabase
        .from('resources')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Recurso atualizado com sucesso!')
      logAccess(`Recursos: Editar - ${form.name}`)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('resources')
        .insert({ ...payload, created_by: user?.id ?? null })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Recurso criado com sucesso!')
      logAccess(`Recursos: Criar - ${form.name}`)
    }

    resetForm()
    const { data } = await supabase.from('resources').select('*').is('deleted_at', null).order('created_at', { ascending: false })
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

  useEffect(() => {
    if (editingId) {
      document.getElementById('resource-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingId])

  async function handleDelete(id: number) {
    const confirmed = await confirmDelete({
      title: 'Excluir Recurso',
      description: 'Tem certeza que deseja excluir este recurso?',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (!confirmed) return
    const resource = resources.find(r => r.id === id)
    const { error } = await supabase
      .from('resources')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Recurso excluído com sucesso!')
    logAccess(`Recursos: Excluir - ${resource?.name ?? id}`)
    setResources((prev) => prev.filter((r) => r.id !== id))
  }

  if (pageLoading) {
    return (
      <div className="relative min-h-screen bg-zinc-950">
        <Navbar userRole={userRole} />
        <main className="relative mx-auto max-w-7xl px-4 py-8 pt-20">
          <PageSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-7xl px-4 py-8 pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Gestão de Recursos</h1>
            <p className="text-zinc-400 mt-1">
              Gerencie equipamentos, veículos e dispositivos de segurança.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV(resources as unknown as Record<string, unknown>[], 'recursos')}
            className="border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar CSV
          </Button>
        </div>

        {canManage(userRole) && (
          <Card className="mb-8 bg-zinc-900/10 border-zinc-700/30" id="resource-form">
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

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar recursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {chipCounts.map((chip) => {
            const isActive = activeChip.id === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setFilterType(chip.type)
                  setFilterStatus(chip.status)
                }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  border transition-all
                  ${isActive
                    ? `${chip.color} ${chip.border} bg-zinc-800/80`
                    : 'text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300 bg-transparent'
                  }
                `}
              >
                <span>{chip.label}</span>
                <span className={`text-xs ${isActive ? 'opacity-80' : 'text-zinc-600'}`}>
                  {chip.count}
                </span>
              </button>
            )
          })}
        </div>

        <Card className="bg-zinc-900/10 border-zinc-700/30">
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
                      <TableCell className="font-medium">
                        <Link href={`/resources/${resource.id}`} className="text-purple-400 hover:text-purple-300 hover:underline transition-colors flex items-center gap-1">
                          {resource.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-zinc-300">{typeLabel[resource.type]}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[resource.status]}>
                          {statusOptions.find(s => s.value === resource.status)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{resource.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/resources/${resource.id}`)}
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                            title="Ver detalhes"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {canManage(userRole) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(resource)}
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                              title="Editar"
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
                              title="Excluir"
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
      {confirmDialog}
    </div>
  )
}

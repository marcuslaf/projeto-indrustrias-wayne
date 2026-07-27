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
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase-client'
import { logAccess } from '@/lib/audit-log'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { PageSkeleton } from '@/components/page-skeleton'
import {
  ClipboardList, Plus, Loader2, Trash2, Search, ExternalLink,
} from 'lucide-react'
import { downloadCSV } from '@/lib/csv'

const priorityLabel: Record<string, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' }
const priorityVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  baixa: 'outline', media: 'secondary', alta: 'default', urgente: 'destructive',
}
const statusLabel: Record<string, string> = {
  aberta: 'Aberta', em_andamento: 'Em Andamento', concluida: 'Concluída', cancelada: 'Cancelada',
}

interface ServiceOrder {
  id: number
  title: string
  description: string | null
  resource_id: number | null
  assigned_to: string | null
  priority: string
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
  resource: { id: number; name: string } | null
  assignee: { id: string; username: string; nome: string } | null
}

interface Props {
  orders: ServiceOrder[]
  resources: { id: number; name: string }[]
  profiles: { id: string; username: string; nome: string }[]
  userRole: string
}

export function ServiceOrdersClient({ orders: initialOrders, resources: initialResources, profiles: initialProfiles, userRole }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [orders, setOrders] = useState<ServiceOrder[]>(initialOrders)
  const [resources, setResources] = useState<{ id: number; name: string }[]>(initialResources)
  const [profiles, setProfiles] = useState<{ id: string; username: string; nome: string }[]>(initialProfiles)
  const [pageLoading, setPageLoading] = useState(initialOrders.length === 0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const { confirm: confirmDelete, dialog: confirmDialog } = useConfirmDialog()

  useEffect(() => {
    async function loadData() {
      const [ordersRes, resourcesRes, profilesRes] = await Promise.all([
        (supabase as any)
          .from('service_orders')
          .select('*, resource:resources(id, name), assignee:profiles!assigned_to(id, username, nome)')
          .order('created_at', { ascending: false }),
        supabase.from('resources').select('id, name').is('deleted_at', null).order('name'),
        supabase.from('profiles').select('id, username, nome').order('nome'),
      ])
      if (ordersRes.data) setOrders(ordersRes.data)
      if (resourcesRes.data) setResources(resourcesRes.data)
      if (profilesRes.data) setProfiles(profilesRes.data)
      setPageLoading(false)
    }
    if (initialOrders.length === 0) loadData()
  }, [])

  const [form, setForm] = useState({
    title: '', description: '', resource_id: '', assigned_to: '', priority: 'media',
  })

  const canManage = userRole === 'admin_seguranca' || userRole === 'gerente'
  const canDelete = userRole === 'admin_seguranca'

  const filtered = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast.error('Título é obrigatório'); return }
    setSaving(true)
    const { error } = await supabase.from('service_orders').insert({
      title: form.title,
      description: form.description || null,
      resource_id: form.resource_id ? Number(form.resource_id) : null,
      assigned_to: form.assigned_to || null,
      priority: form.priority as 'baixa' | 'media' | 'alta' | 'urgente',
    })
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Ordem de serviço criada!')
    logAccess(`Ordem: Criar - ${form.title}`)
    setForm({ title: '', description: '', resource_id: '', assigned_to: '', priority: 'media' })
    setShowForm(false)
    setSaving(false)
    refresh()
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase.from('service_orders').update({ status: status as 'aberta' | 'em_andamento' | 'concluida' | 'cancelada', updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(`Status atualizado para ${statusLabel[status]}`)
    refresh()
  }

  async function handleDelete(id: number, title: string) {
    const confirmed = await confirmDelete({
      title: 'Excluir Ordem',
      description: `Tem certeza que deseja excluir "${title}"?`,
      confirmLabel: 'Excluir',
      variant: 'destructive',
    })
    if (!confirmed) return
    const { error } = await supabase.from('service_orders').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Ordem excluída!')
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  async function refresh() {
    const { data } = await (supabase
      .from('service_orders') as any)
      .select('*, resource:resources(id, name), assignee:profiles!assigned_to(id, username, nome)')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  if (pageLoading) {
    return (
      <div className="relative min-h-screen bg-zinc-950">
        <Navbar userRole={userRole} />
        <main className="relative mx-auto max-w-5xl px-4 py-8 pt-20">
          <PageSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-5xl px-4 py-8 pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-purple-500" />
              Ordens de Serviço
            </h1>
            <p className="text-zinc-400 mt-1">Gerencie solicitações de manutenção e reparos.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(orders as unknown as Record<string, unknown>[], 'ordens-servico')}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100"
            >
              <ExternalLink className="h-4 w-4 mr-1 rotate-90" />
              CSV
            </Button>
            {canManage && (
              <Button
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Ordem
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card className="mb-8 bg-zinc-900/10 border-zinc-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">Nova Ordem de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Título *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Descrição</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Recurso</Label>
                    <Select value={form.resource_id} onValueChange={(v) => v && setForm({ ...form, resource_id: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        {resources.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Responsável</Label>
                    <Select value={form.assigned_to} onValueChange={(v) => v && setForm({ ...form, assigned_to: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Atribuir a..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome || p.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Prioridade</Label>
                    <Select value={form.priority} onValueChange={(v) => v && setForm({ ...form, priority: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        {Object.entries(priorityLabel).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Criar Ordem
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar ordens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(statusLabel).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-zinc-900/10 border-zinc-700/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Título</TableHead>
                  <TableHead className="text-zinc-400">Prioridade</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Recurso</TableHead>
                  <TableHead className="text-zinc-400">Responsável</TableHead>
                  <TableHead className="text-zinc-400 w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-8">Nenhuma ordem encontrada.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell>
                        <div>
                          <p className="text-zinc-100 font-medium">{order.title}</p>
                          {order.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{order.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityVariant[order.priority]}>{priorityLabel[order.priority]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => v && v !== order.status && updateStatus(order.id, v)}
                        >
                          <SelectTrigger className="h-7 w-36 bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                            {Object.entries(statusLabel).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm">
                        {order.resource?.name ?? <span className="text-zinc-600">—</span>}
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm">
                        {order.assignee?.nome || order.assignee?.username || <span className="text-zinc-600">—</span>}
                      </TableCell>
                      <TableCell>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id, order.title)}
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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

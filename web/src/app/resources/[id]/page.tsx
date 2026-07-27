'use client'

import { useState, useEffect, useRef } from 'react'
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
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase-client'
import { logAccess } from '@/lib/audit-log'
import { useConfirmDialog } from '@/components/confirm-dialog'
import QRCode from 'qrcode'
import {
  Package, ArrowLeft, Save, Loader2, Calendar, MapPin, Wrench, Barcode,
  Plus, History, DollarSign, User, Trash2, QrCode,
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

function QRCodeCard({ resourceId, resourceName }: { resourceId: number; resourceName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return
    const url = `${window.location.origin}/resources/${resourceId}`
    QRCode.toCanvas(canvasRef.current, url, {
      width: 140,
      margin: 1,
      color: { dark: '#a855f7', light: '#18181b' },
    })
  }, [resourceId])

  return (
    <Card className="bg-zinc-900/10 border-zinc-700/30 mt-6">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-purple-500" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <canvas ref={canvasRef} className="rounded-lg" />
        <p className="text-xs text-zinc-500 text-center max-w-48">
          Escaneie para acessar {resourceName}
        </p>
      </CardContent>
    </Card>
  )
}

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
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({ description: '', performed_by: '', maintenance_date: '', cost: '' })
  const [savingMaintenance, setSavingMaintenance] = useState(false)
  const { confirm: confirmDelete, dialog: confirmDialog } = useConfirmDialog()

  const id = Number(params.id)
  const canManage = userRole === 'admin_seguranca' || userRole === 'gerente'
  const canDelete = userRole === 'admin_seguranca'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserRole(user.user_metadata?.role ?? 'funcionario')

    const { data } = await supabase.from('resources').select('*').eq('id', id).is('deleted_at', null).single()
    if (!data) { router.push('/resources'); return }
    const r = data
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

  useEffect(() => {
    if (!id) return
    supabase.from('maintenance_history')
      .select('*')
      .eq('resource_id', id)
      .order('maintenance_date', { ascending: false })
      .then(({ data }) => {
        if (data) setMaintenance(data)
      })
  }, [id])

  async function handleAddMaintenance(e: React.FormEvent) {
    e.preventDefault()
    if (!maintenanceForm.description) { toast.error('Descrição é obrigatória'); return }
    setSavingMaintenance(true)
    const { error } = await supabase.from('maintenance_history').insert({
      resource_id: id,
      description: maintenanceForm.description,
      performed_by: maintenanceForm.performed_by || null,
      maintenance_date: maintenanceForm.maintenance_date || new Date().toISOString().split('T')[0],
      cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : null,
    })
    if (error) { toast.error(error.message); setSavingMaintenance(false); return }
    toast.success('Manutenção registrada!')
    logAccess(`Manutenção: ${resource?.name} - ${maintenanceForm.description}`)
    setMaintenanceForm({ description: '', performed_by: '', maintenance_date: '', cost: '' })
    setShowMaintenanceForm(false)
    setSavingMaintenance(false)
    const { data } = await supabase.from('maintenance_history')
      .select('*').eq('resource_id', id).order('maintenance_date', { ascending: false })
    if (data) setMaintenance(data)
  }

  async function handleDeleteMaintenance(mtceId: number) {
    const confirmed = await confirmDelete({
      title: 'Excluir Registro',
      description: 'Tem certeza que deseja excluir este registro de manutenção?',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (!confirmed) return
    const { error } = await supabase.from('maintenance_history').delete().eq('id', mtceId)
    if (error) { toast.error(error.message); return }
    toast.success('Registro excluído!')
    setMaintenance((prev: any[]) => prev.filter((m: any) => m.id !== mtceId))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      type: form.type as 'equipamento' | 'veiculo' | 'dispositivo_seguranca',
      serial_number: form.serial_number || null,
      plate: form.plate || null,
      location: form.location,
      status: form.status as 'disponivel' | 'em_uso' | 'em_manutencao',
      acquisition_date: form.acquisition_date,
      last_maintenance_date: form.last_maintenance_date || null,
    }
    const { error } = await supabase.from('resources').update(payload).eq('id', id)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Recurso atualizado!')
    logAccess(`Recursos: Editar - ${form.name}`)
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

  return (
    <div className="relative min-h-screen bg-zinc-950">
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
                  <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v })}>
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
                  <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v })}>
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

        <Card className="bg-zinc-900/10 border-zinc-700/30 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <History className="h-5 w-5 text-purple-500" />
                Histórico de Manutenção
              </CardTitle>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                  className="border-zinc-700 text-zinc-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Registrar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showMaintenanceForm && (
              <form onSubmit={handleAddMaintenance} className="mb-6 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50 space-y-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Descrição *</Label>
                  <Input
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="O que foi feito?"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Responsável</Label>
                    <Input
                      value={maintenanceForm.performed_by}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_by: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="Quem realizou?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Data</Label>
                    <Input
                      type="date"
                      value={maintenanceForm.maintenance_date}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_date: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={savingMaintenance} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    {savingMaintenance && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Salvar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowMaintenanceForm(false)} className="text-zinc-400">
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {maintenance.length === 0 ? (
              <p className="text-zinc-500 text-sm py-2">Nenhum registro de manutenção.</p>
            ) : (
              <div className="space-y-3">
                {maintenance.map((m: any) => (
                  <div key={m.id} className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/20 border border-zinc-800">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-200">{m.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.maintenance_date).toLocaleDateString('pt-BR')}
                        </span>
                        {m.performed_by && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {m.performed_by}
                          </span>
                        )}
                        {m.cost && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {Number(m.cost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMaintenance(m.id)}
                        className="h-7 w-7 text-red-400 hover:text-red-300 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <QRCodeCard resourceId={id} resourceName={resource.name} />
      </main>
      <Toaster richColors />
      {confirmDialog}
    </div>
  )
}

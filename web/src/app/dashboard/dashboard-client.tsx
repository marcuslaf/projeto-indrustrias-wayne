'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  Package, Wrench, ShieldCheck, Truck, AlertTriangle, Activity,
  RefreshCw, ExternalLink,
} from 'lucide-react'

interface ResourceItem {
  id: number; name: string; type: string; status: string
  last_maintenance_date: string | null; serial_number: string | null; plate: string | null
  location: string; acquisition_date: string
}

interface LogItem {
  id: number; access_area: string; access_time: string; status: string
}

export interface DashboardStats {
  totalResources: number
  equipmentInUse: number
  vehiclesInUse: number
  securityDevicesActive: number
  available: number
  inMaintenance: number
  recentLogs: LogItem[]
  allLogs: LogItem[]
  maintenanceResources: ResourceItem[]
  overdueMaintenance: { id: number; name: string }[]
  resourcesByType: { name: string; value: number }[]
  resourcesByStatus: { name: string; value: number }[]
  logsByDay: { day: string; sucesso: number; falha: number }[]
}

interface DashboardClientProps {
  profile: { role: string; nome: string } | null
  stats: DashboardStats
  userRole: string
}

const CHART_COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#22c55e', '#eab308', '#ef4444']

const typeLabel: Record<string, string> = {
  equipamento: 'Equipamento',
  veiculo: 'Veículo',
  dispositivo_seguranca: 'Dispositivo de Segurança',
}

const typeColor: Record<string, string> = {
  equipamento: '#6366f1',
  veiculo: '#22c55e',
  dispositivo_seguranca: '#a855f7',
}

const statusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  em_uso: 'Em Uso',
  em_manutencao: 'Em Manutenção',
}

const statusColor: Record<string, string> = {
  disponivel: '#22c55e',
  em_uso: '#eab308',
  em_manutencao: '#ef4444',
}

export function DashboardClient({ profile, stats, userRole }: DashboardClientProps) {
  const router = useRouter()
  const [period, setPeriod] = useState('7')
  const [resourceFilter, setResourceFilter] = useState('all')

  const periodDays = Number(period)

  const filteredLogs = periodDays === 0
    ? stats.allLogs
    : stats.allLogs.filter(log => {
        const logDate = new Date(log.access_time)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - periodDays)
        return logDate >= cutoff
      })

  const logsByDay = (() => {
    const dayMap = new Map<string, { sucesso: number; falha: number }>()
    const today = new Date()
    const daysToShow = periodDays || 7
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('pt-BR')
      dayMap.set(key, { sucesso: 0, falha: 0 })
    }
    for (const log of filteredLogs) {
      const d = new Date(log.access_time).toLocaleDateString('pt-BR')
      if (dayMap.has(d)) {
        const entry = dayMap.get(d)!
        if (log.status === 'sucesso') entry.sucesso++
        else entry.falha++
      }
    }
    return Array.from(dayMap.entries()).map(([day, value]) => ({ day, ...value }))
  })()

  const filteredMaintenance = resourceFilter === 'all'
    ? stats.maintenanceResources
    : stats.maintenanceResources.filter(r => r.type === resourceFilter)

  const cards = [
    {
      title: 'Equipamentos em Uso',
      value: stats.equipmentInUse,
      icon: Package,
      color: 'text-blue-500',
      href: '/resources?type=equipamento&status=em_uso',
    },
    {
      title: 'Veículos em Operação',
      value: stats.vehiclesInUse,
      icon: Truck,
      color: 'text-emerald-500',
      href: '/resources?type=veiculo&status=em_uso',
    },
    {
      title: 'Dispositivos de Segurança',
      value: stats.securityDevicesActive,
      icon: ShieldCheck,
      color: 'text-purple-500',
      href: '/resources?type=dispositivo_seguranca&status=em_uso',
    },
    {
      title: 'Em Manutenção',
      value: stats.inMaintenance,
      icon: Wrench,
      color: 'text-amber-500',
      href: '/resources?status=em_manutencao',
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="border rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: '#18181b', borderColor: '#3f3f46', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
          <p className="font-medium mb-1" style={{ color: '#d4d4d8' }}>{payload[0].name || label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-[url('/gotham-bg.jpg')] bg-cover bg-center opacity-[0.12] pointer-events-none" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard de Operações</h1>
            <p className="text-zinc-400 mt-1">
              Bem-vindo, {profile?.nome ?? 'Usuário'} — Visão geral do status da Wayne Enterprises.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
              <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-zinc-300 text-sm h-9">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="0">Todos os registros</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.refresh()}
              className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.title}
                onClick={() => router.push(card.href)}
                className="text-left"
              >
                <Card className="bg-zinc-900/10 border-zinc-700/30 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                      {card.value}
                      <ExternalLink className="h-3 w-3 text-zinc-600" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>

        {stats.overdueMaintenance.length > 0 && (
          <Card className="mb-8 border-amber-700/40 bg-amber-950/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">
                    {stats.overdueMaintenance.length} {stats.overdueMaintenance.length === 1 ? 'recurso com' : 'recursos com'} manutenção vencida
                  </p>
                  <p className="text-xs text-amber-400/70 mt-1">
                    {stats.overdueMaintenance.map((r) => r.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">Visão Geral</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-800">Atividade</TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-zinc-800">Gráficos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-zinc-900/10 border-zinc-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredLogs.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Nenhuma atividade registrada ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                          <div>
                            <p className="text-sm text-zinc-300">{log.access_area}</p>
                            <p className="text-xs text-zinc-500">
                              {new Date(log.access_time).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant={log.status === 'sucesso' ? 'default' : 'destructive'}>
                            {log.status === 'sucesso' ? 'Sucesso' : 'Falha'}
                          </Badge>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push('/logs')}
                        className="text-purple-400 hover:text-purple-300 px-0"
                      >
                        Ver todos os logs →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/10 border-zinc-700/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Recursos em Manutenção
                  </CardTitle>
                  <Select value={resourceFilter} onValueChange={(v) => v && setResourceFilter(v)}>
                    <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-300 text-sm h-8">
                      <SelectValue placeholder="Filtrar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="equipamento">Equipamentos</SelectItem>
                      <SelectItem value="veiculo">Veículos</SelectItem>
                      <SelectItem value="dispositivo_seguranca">Dispositivos</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {filteredMaintenance.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Nenhum recurso em manutenção.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredMaintenance.map((res) => (
                        <div key={res.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-zinc-300">{res.name}</p>
                            <p className="text-xs text-zinc-500">{typeLabel[res.type] ?? res.type}</p>
                          </div>
                          <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                            {res.last_maintenance_date
                              ? new Date(res.last_maintenance_date).toLocaleDateString('pt-BR')
                              : 'Sem data'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="bg-zinc-900/10 border-zinc-700/30">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-100">Registro de Atividades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800">
                  {filteredLogs.length === 0 ? (
                    <p className="text-zinc-500 text-sm p-6">Nenhuma atividade registrada.</p>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30 transition-colors">
                        <div>
                          <p className="text-sm text-zinc-300">{log.access_area}</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(log.access_time).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant={log.status === 'sucesso' ? 'default' : 'destructive'}>
                          {log.status === 'sucesso' ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-zinc-900/10 border-zinc-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100">Recursos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.resourcesByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.resourcesByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={typeColor[entry.name] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }} />
                        <Legend
                          formatter={(value: string) => <span className="text-zinc-400 text-sm">{typeLabel[value] ?? value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/10 border-zinc-700/30">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100">Recursos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.resourcesByStatus}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="name"
                          tickFormatter={(v) => statusLabel[v] ?? v}
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }} />
                        <Bar dataKey="value" name="Recursos" radius={[4, 4, 0, 0]}>
                          {stats.resourcesByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={statusColor[entry.name] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {logsByDay.length > 0 && logsByDay.some(d => d.sucesso > 0 || d.falha > 0) && (
                <Card className="bg-zinc-900/10 border-zinc-700/30 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg text-zinc-100">Acessos por Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={logsByDay}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="day"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          />
                          <YAxis
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} wrapperStyle={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }} />
                          <Legend
                            formatter={(value: string) => <span className="text-zinc-400 text-sm">{value === 'sucesso' ? 'Sucesso' : 'Falha'}</span>}
                          />
                          <Bar dataKey="sucesso" name="sucesso" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                          <Bar dataKey="falha" name="falha" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

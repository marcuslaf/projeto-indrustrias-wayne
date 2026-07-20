'use client'

import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Wrench, ShieldCheck, Truck, AlertTriangle, Activity } from 'lucide-react'

interface ResourceItem {
  id: number; name: string; type: string; status: string
  last_maintenance_date: string | null; serial_number: string | null; plate: string | null
  location: string; acquisition_date: string
}

interface LogItem {
  id: number; access_area: string; access_time: string; status: string
}

interface DashboardStats {
  totalResources: number
  equipmentInUse: number
  vehiclesInUse: number
  securityDevicesActive: number
  available: number
  inMaintenance: number
  recentLogs: LogItem[]
  maintenanceResources: ResourceItem[]
}

interface DashboardClientProps {
  profile: { role: string; nome: string } | null
  stats: DashboardStats
  userRole: string
}

const typeLabel: Record<string, string> = {
  equipamento: 'Equipamento',
  veiculo: 'Veículo',
  dispositivo_seguranca: 'Dispositivo de Segurança',
}

export function DashboardClient({ profile, stats, userRole }: DashboardClientProps) {
  const cards = [
    { title: 'Equipamentos em Uso', value: stats.equipmentInUse, icon: Package, color: 'text-blue-500' },
    { title: 'Veículos em Operação', value: stats.vehiclesInUse, icon: Truck, color: 'text-emerald-500' },
    { title: 'Dispositivos de Segurança', value: stats.securityDevicesActive, icon: ShieldCheck, color: 'text-purple-500' },
    { title: 'Em Manutenção', value: stats.inMaintenance, icon: Wrench, color: 'text-amber-500' },
  ]

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
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard de Operações</h1>
          <p className="text-zinc-400 mt-1">
            Bem-vindo, {profile?.nome ?? 'Usuário'} — Visão geral do status da Wayne Enterprises.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-100">{card.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentLogs.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhuma atividade registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentLogs.map((log) => (
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
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Recursos em Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.maintenanceResources.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhum recurso em manutenção.</p>
              ) : (
                <div className="space-y-3">
                  {stats.maintenanceResources.map((res) => (
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
      </main>
    </div>
  )
}

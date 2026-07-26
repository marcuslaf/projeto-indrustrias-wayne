import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'
  const nome = (user?.user_metadata?.nome as string) ?? 'Usuário'

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .is('deleted_at', null)

  const { data: logs } = await supabase
    .from('access_logs')
    .select('*')
    .order('access_time', { ascending: false })
    .limit(50)

  const res = (resources ?? []) as unknown as {
    id: number; name: string; type: string; status: string; location: string
    serial_number: string | null; plate: string | null
    acquisition_date: string; last_maintenance_date: string | null
    created_by: string | null; created_at: string; updated_at: string; deleted_at: string | null
  }[]

  const logsArr = (logs ?? []) as unknown as {
    id: number; user_id: string | null; access_area: string
    access_time: string; status: string; ip_address: string | null
  }[]

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const overdueMaintenance = res.filter((r) => {
    const refDate = r.last_maintenance_date ? new Date(r.last_maintenance_date) : new Date(r.acquisition_date)
    return refDate < oneYearAgo
  })

  const resourcesByType = ['equipamento', 'veiculo', 'dispositivo_seguranca']
    .map(type => ({ name: type, value: res.filter(r => r.type === type).length }))
    .filter(d => d.value > 0)

  const resourcesByStatus = ['disponivel', 'em_uso', 'em_manutencao']
    .map(status => ({ name: status, value: res.filter(r => r.status === status).length }))
    .filter(d => d.value > 0)

  const totalLogs = logsArr

  const stats = {
    totalResources: res.length,
    equipmentInUse: res.filter(r => r.type === 'equipamento' && r.status === 'em_uso').length,
    vehiclesInUse: res.filter(r => r.type === 'veiculo' && r.status === 'em_uso').length,
    securityDevicesActive: res.filter(r => r.type === 'dispositivo_seguranca' && r.status === 'em_uso').length,
    available: res.filter(r => r.status === 'disponivel').length,
    inMaintenance: res.filter(r => r.status === 'em_manutencao').length,
    recentLogs: totalLogs.slice(0, 10),
    allLogs: totalLogs,
    maintenanceResources: res.filter(r => r.status === 'em_manutencao'),
    overdueMaintenance: overdueMaintenance.map((r) => ({ id: r.id, name: r.name })),
    resourcesByType,
    resourcesByStatus,
    logsByDay: [],
  }

  return <DashboardClient profile={{ role: userRole, nome }} stats={stats} userRole={userRole} />
}

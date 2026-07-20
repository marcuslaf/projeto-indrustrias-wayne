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
    .limit(10)

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

  const stats = {
    totalResources: res.length,
    equipmentInUse: res.filter(r => r.type === 'equipamento' && r.status === 'em_uso').length,
    vehiclesInUse: res.filter(r => r.type === 'veiculo' && r.status === 'em_uso').length,
    securityDevicesActive: res.filter(r => r.type === 'dispositivo_seguranca' && r.status === 'em_uso').length,
    available: res.filter(r => r.status === 'disponivel').length,
    inMaintenance: res.filter(r => r.status === 'em_manutencao').length,
    recentLogs: logsArr,
    maintenanceResources: res.filter(r => r.status === 'em_manutencao'),
  }

  return <DashboardClient profile={{ role: userRole, nome }} stats={stats} userRole={userRole} />
}

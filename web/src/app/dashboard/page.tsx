import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'
  const nome = (user?.user_metadata?.nome as string) ?? 'Usuário'

  return <DashboardClient profile={{ role: userRole, nome }} userRole={userRole} />
}

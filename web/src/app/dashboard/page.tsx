import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  let userRole = 'funcionario'
  let nome = 'Usuário'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nome')
      .eq('id', user.id)
      .single()
    if (profile) {
      userRole = profile.role
      nome = profile.nome
    }
  }

  return <DashboardClient profile={{ role: userRole, nome }} userRole={userRole} />
}

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AdminUsersClient } from './admin-users-client'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminUsersClient
      profiles={(profiles ?? []) as never[]}
      userRole={userRole}
    />
  )
}

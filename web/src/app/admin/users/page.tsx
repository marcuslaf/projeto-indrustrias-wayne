import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AdminUsersClient } from './admin-users-client'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login'); return }

  const profileData = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
  const profile = profileData.data?.[0]
  const userRole = (profile?.role as string) ?? (user?.user_metadata?.role as string) ?? 'funcionario'
  if (userRole !== 'admin_seguranca') { redirect('/dashboard'); return }

  return (
    <AdminUsersClient
      profiles={[]}
      userRole={userRole}
    />
  )
}

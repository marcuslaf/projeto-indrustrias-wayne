import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ServiceOrdersClient } from './service-orders-client'

export default async function ServiceOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  let userRole = 'funcionario'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) userRole = profile.role
  }

  return (
    <ServiceOrdersClient
      orders={[]}
      resources={[]}
      profiles={[]}
      userRole={userRole}
    />
  )
}

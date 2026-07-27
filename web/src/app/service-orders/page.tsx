import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ServiceOrdersClient } from './service-orders-client'

export default async function ServiceOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'

  return (
    <ServiceOrdersClient
      orders={[]}
      resources={[]}
      profiles={[]}
      userRole={userRole}
    />
  )
}

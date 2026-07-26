import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ServiceOrdersClient } from './service-orders-client'
import type { Resource } from '@/db/schema'

interface Profile {
  id: string
  username: string
  nome: string
}

export default async function ServiceOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'

  const { data: orders } = await supabase
    .from('service_orders')
    .select('*, resource:resources(id, name), assignee:profiles!assigned_to(id, username, nome)')
    .order('created_at', { ascending: false })

  const { data: resources } = await supabase
    .from('resources')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, nome')
    .order('nome')

  return (
    <ServiceOrdersClient
      orders={(orders ?? []) as any[]}
      resources={(resources ?? []) as Pick<Resource, 'id' | 'name'>[]}
      profiles={(profiles ?? []) as Profile[]}
      userRole={userRole}
    />
  )
}

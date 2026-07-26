import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ResourcesClient } from './resources-client'
import type { Resource } from '@/db/schema'

export default async function ResourcesPage(props: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = (user?.user_metadata?.role as string) ?? 'funcionario'

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <ResourcesClient
      resources={(resources ?? []) as Resource[]}
      userRole={userRole}
      defaultType={searchParams.type as Resource['type'] | undefined}
      defaultStatus={searchParams.status as Resource['status'] | undefined}
    />
  )
}

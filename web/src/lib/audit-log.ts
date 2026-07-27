import { createClient } from './supabase-client'

export async function logAccess(area: string, status: 'sucesso' | 'falha' = 'sucesso') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('access_logs').insert({
    access_area: area,
    access_time: new Date().toISOString(),
    status,
    user_id: user?.id ?? null,
  })
}

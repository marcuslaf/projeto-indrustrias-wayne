import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const role = user.user_metadata?.role as string
  if (!role || role !== 'admin_seguranca') {
    return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
  }

  const { userId } = await request.json()

  const { error } = await (supabase.rpc as any)('admin_delete_user', { user_id: userId })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Usuário excluído' })
}

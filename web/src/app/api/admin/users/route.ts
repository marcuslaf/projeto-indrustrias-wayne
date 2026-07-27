import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const profile = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile.error || profile.data?.role !== 'admin_seguranca') {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = z.object({ userId: z.string().uuid() }).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 })
    }

    const { error } = await supabase.rpc('admin_delete_user', { user_id: parsed.data.userId })
    if (error) {
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Usuário excluído' })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = user.user_metadata?.role as string
    if (role !== 'admin_seguranca') {
      return NextResponse.json({ error: 'Apenas admin_seguranca pode executar seed' }, { status: 403 })
    }

    const seeds: {
      name: string; type: 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
      serial_number?: string; plate?: string; location: string
      status: 'disponivel' | 'em_uso' | 'em_manutencao'
      acquisition_date: string; last_maintenance_date?: string
    }[] = [
      { name: 'Servidor Principal Arkham', type: 'equipamento', serial_number: 'SRV-ARK-001', location: 'Sala de Servidores - Arkham', status: 'em_uso', acquisition_date: '2025-01-15', last_maintenance_date: '2026-06-01' },
      { name: 'Van de Transporte Tático', type: 'veiculo', plate: 'VTT-2026', location: 'Garagem Principal', status: 'disponivel', acquisition_date: '2026-03-10' },
      { name: 'Scanner Biométrico Portátil', type: 'dispositivo_seguranca', serial_number: 'BIO-SCAN-042', location: 'Ala de Segurança', status: 'em_manutencao', acquisition_date: '2024-11-20', last_maintenance_date: '2026-05-15' },
    ]

    const results: { name: string; status: string; error?: string }[] = []

    for (const seed of seeds) {
      const { error } = await supabase
        .from('resources')
        .insert({ ...seed, created_by: user.id })

      if (!error) {
        await supabase.from('access_logs').insert({
          access_area: `Recursos: Seed - ${seed.name}`,
          access_time: new Date().toISOString(),
          status: 'sucesso',
          user_id: user.id,
        })
      }

      results.push({
        name: seed.name,
        status: error ? 'error' : 'created',
        error: error?.message,
      })
    }

    return NextResponse.json({
      message: 'Seed executado com sucesso!',
      results,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Use GET para executar o seed.' })
}

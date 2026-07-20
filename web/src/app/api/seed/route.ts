import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Use o script de seed via SQL no painel Supabase.',
    users: ['admin / admin123', 'gerente / gerente123', 'funcionario / funcionario123'],
  })
}

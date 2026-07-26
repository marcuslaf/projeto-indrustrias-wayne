import { createBrowserClient } from '@supabase/ssr'

export type Database = {
  public: {
    Tables: {
      access_logs: {
        Row: {
          access_area: string
          access_time: string
          id: number
          ip_address: string | null
          status: 'sucesso' | 'falha'
          user_id: string | null
        }
        Insert: {
          access_area: string
          access_time?: string
          id?: number
          ip_address?: string | null
          status?: 'sucesso' | 'falha'
          user_id?: string | null
        }
        Update: {
          access_area?: string
          access_time?: string
          id?: number
          ip_address?: string | null
          status?: 'sucesso' | 'falha'
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          role: 'funcionario' | 'gerente' | 'admin_seguranca'
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome: string
          role?: 'funcionario' | 'gerente' | 'admin_seguranca'
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: 'funcionario' | 'gerente' | 'admin_seguranca'
          updated_at?: string
          username?: string
        }
      }
      resources: {
        Row: {
          acquisition_date: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: number
          last_maintenance_date: string | null
          location: string
          name: string
          plate: string | null
          serial_number: string | null
          status: 'disponivel' | 'em_uso' | 'em_manutencao'
          type: 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
          updated_at: string
        }
        Insert: {
          acquisition_date: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: number
          last_maintenance_date?: string | null
          location: string
          name: string
          plate?: string | null
          serial_number?: string | null
          status?: 'disponivel' | 'em_uso' | 'em_manutencao'
          type: 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
          updated_at?: string
        }
        Update: {
          acquisition_date?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: number
          last_maintenance_date?: string | null
          location?: string
          name?: string
          plate?: string | null
          serial_number?: string | null
          status?: 'disponivel' | 'em_uso' | 'em_manutencao'
          type?: 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

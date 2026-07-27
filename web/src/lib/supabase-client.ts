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
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: number
          org_id: string | null
          user_id: string | null
          action: string
          entity: string
          entity_id: string | null
          old_data: Record<string, unknown> | null
          new_data: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          org_id?: string | null
          user_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          old_data?: Record<string, unknown> | null
          new_data?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          org_id?: string | null
          user_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          old_data?: Record<string, unknown> | null
          new_data?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      service_orders: {
        Row: {
          id: number
          title: string
          description: string | null
          resource_id: number | null
          assigned_to: string | null
          priority: 'baixa' | 'media' | 'alta' | 'urgente'
          status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          resource_id?: number | null
          assigned_to?: string | null
          priority?: 'baixa' | 'media' | 'alta' | 'urgente'
          status?: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          resource_id?: number | null
          assigned_to?: string | null
          priority?: 'baixa' | 'media' | 'alta' | 'urgente'
          status?: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      maintenance_history: {
        Row: {
          id: number
          resource_id: number
          description: string
          performed_by: string | null
          maintenance_date: string
          cost: number | null
          created_at: string
        }
        Insert: {
          id?: number
          resource_id: number
          description: string
          performed_by?: string | null
          maintenance_date?: string
          cost?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          resource_id?: number
          description?: string
          performed_by?: string | null
          maintenance_date?: string
          cost?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      delete_old_logs: {
        Args: { days: number }
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

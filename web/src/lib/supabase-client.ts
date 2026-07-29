import { createBrowserClient } from '@supabase/ssr'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_logs: {
        Row: {
          access_area: string
          access_time: string
          id: number
          ip_address: string | null
          status: Database['public']['Enums']['access_status']
          user_id: string | null
        }
        Insert: {
          access_area: string
          access_time?: string
          id?: number
          ip_address?: string | null
          status?: Database['public']['Enums']['access_status']
          user_id?: string | null
        }
        Update: {
          access_area?: string
          access_time?: string
          id?: number
          ip_address?: string | null
          status?: Database['public']['Enums']['access_status']
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'access_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity: string
          entity_id: string | null
          id: number
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          org_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      maintenance_history: {
        Row: {
          cost: number | null
          created_at: string
          description: string
          id: number
          maintenance_date: string
          performed_by: string
          resource_id: number
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description: string
          id?: never
          maintenance_date?: string
          performed_by?: string
          resource_id: number
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string
          id?: never
          maintenance_date?: string
          performed_by?: string
          resource_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_history_resource_id_fkey'
            columns: ['resource_id']
            isOneToOne: false
            referencedRelation: 'resources'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          role: Database['public']['Enums']['user_role']
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: Database['public']['Enums']['user_role']
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
          status: Database['public']['Enums']['resource_status']
          type: Database['public']['Enums']['resource_type']
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
          status?: Database['public']['Enums']['resource_status']
          type: Database['public']['Enums']['resource_type']
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
          status?: Database['public']['Enums']['resource_status']
          type?: Database['public']['Enums']['resource_type']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'resources_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      service_orders: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          priority: Database['public']['Enums']['service_order_priority']
          resource_id: number | null
          status: Database['public']['Enums']['service_order_status']
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          priority?: Database['public']['Enums']['service_order_priority']
          resource_id?: number | null
          status?: Database['public']['Enums']['service_order_status']
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          priority?: Database['public']['Enums']['service_order_priority']
          resource_id?: number | null
          status?: Database['public']['Enums']['service_order_status']
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'service_orders_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_resource_id_fkey'
            columns: ['resource_id']
            isOneToOne: false
            referencedRelation: 'resources'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: { Args: { user_id: string }; Returns: undefined }
      delete_old_logs: { Args: { days?: number }; Returns: number }
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      access_status: 'sucesso' | 'falha'
      resource_status: 'disponivel' | 'em_uso' | 'em_manutencao'
      resource_type: 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
      service_order_priority: 'baixa' | 'media' | 'alta' | 'urgente'
      service_order_status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'
      user_role: 'funcionario' | 'gerente' | 'admin_seguranca'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

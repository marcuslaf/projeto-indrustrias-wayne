import type { Database } from '@/lib/supabase-client'

export type UserRole = Database['public']['Enums']['user_role']
export type ResourceType = Database['public']['Enums']['resource_type']
export type ResourceStatus = Database['public']['Enums']['resource_status']
export type AccessStatus = Database['public']['Enums']['access_status']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type AccessLog = Database['public']['Tables']['access_logs']['Row']

export type UserRole = 'funcionario' | 'gerente' | 'admin_seguranca'
export type ResourceType = 'equipamento' | 'veiculo' | 'dispositivo_seguranca'
export type ResourceStatus = 'disponivel' | 'em_uso' | 'em_manutencao'
export type AccessStatus = 'sucesso' | 'falha'

export interface Profile {
  id: string
  username: string
  role: UserRole
  nome: string
  email: string | null
  created_at: string
  updated_at: string
}

export interface Resource {
  id: number
  name: string
  type: ResourceType
  serial_number: string | null
  plate: string | null
  location: string
  status: ResourceStatus
  acquisition_date: string
  last_maintenance_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AccessLog {
  id: number
  user_id: string | null
  access_area: string
  access_time: string
  status: AccessStatus
  ip_address: string | null
}

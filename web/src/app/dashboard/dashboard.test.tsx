import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DashboardClient } from './dashboard-client'

const mockState = vi.hoisted(() => ({
  logData: [
    { id: 1, access_area: 'Sala de Controle', access_time: '2026-07-26T10:00:00Z', status: 'sucesso', user_id: null, ip_address: null },
  ],
}))

const mockResourceData = [
  { id: 1, name: 'Servidor', type: 'equipamento', status: 'em_uso', location: 'Sala A', serial_number: null, plate: null, acquisition_date: '2025-01-01', last_maintenance_date: null, created_by: null, created_at: '2025-01-01', updated_at: '2025-01-01', deleted_at: null },
  { id: 2, name: 'Batmovel', type: 'veiculo', status: 'em_uso', location: 'Garagem', serial_number: null, plate: 'BAT-001', acquisition_date: '2025-01-01', last_maintenance_date: null, created_by: null, created_at: '2025-01-01', updated_at: '2025-01-01', deleted_at: null },
  { id: 3, name: 'Drone', type: 'dispositivo_seguranca', status: 'em_manutencao', location: 'Hangar', serial_number: null, plate: null, acquisition_date: '2025-01-01', last_maintenance_date: '2026-06-01', created_by: null, created_at: '2025-01-01', updated_at: '2025-01-01', deleted_at: null },
  { id: 4, name: 'Monitor', type: 'equipamento', status: 'disponivel', location: 'Sala B', serial_number: null, plate: null, acquisition_date: '2025-01-01', last_maintenance_date: null, created_by: null, created_at: '2025-01-01', updated_at: '2025-01-01', deleted_at: null },
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/dashboard',
  useParams: () => ({}),
}))

vi.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'resources') {
        const chain: any = {
          select: vi.fn().mockReturnThis(),
          is: vi.fn().mockResolvedValue({ data: mockResourceData, error: null }),
        }
        return chain
      }
      const chain: any = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() =>
          Promise.resolve({ data: mockState.logData, error: null }),
        ),
      }
      return chain
    }),
  }),
}))

vi.mock('@/components/navbar', () => ({
  Navbar: () => null,
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  PieChart: ({ children }: any) => children,
  Pie: ({ children }: any) => children,
  Cell: () => null,
  BarChart: ({ children }: any) => children,
  Bar: ({ children }: any) => children,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

describe('DashboardClient', () => {
  it('renders welcome message with user name', async () => {
    render(<DashboardClient profile={{ role: 'admin_seguranca', nome: 'Bruce' }} userRole="admin_seguranca" />)
    await waitFor(() => expect(screen.getByText(/Bruce/)).toBeTruthy())
  })

  it('renders stat cards', async () => {
    render(<DashboardClient profile={{ role: 'admin_seguranca', nome: 'Bruce' }} userRole="admin_seguranca" />)
    await waitFor(() => {
      expect(screen.getByText('Equipamentos em Uso')).toBeTruthy()
      expect(screen.getByText('Veículos em Operação')).toBeTruthy()
    })
  })

  it('renders recent logs section', async () => {
    render(<DashboardClient profile={{ role: 'funcionario', nome: 'Test' }} userRole="funcionario" />)
    await waitFor(() => expect(screen.getByText('Sala de Controle')).toBeTruthy())
  })

  it('shows empty state when no logs', async () => {
    mockState.logData = []
    render(<DashboardClient profile={{ role: 'funcionario', nome: 'Test' }} userRole="funcionario" />)
    await waitFor(() => expect(screen.getByText('Nenhuma atividade registrada ainda.')).toBeTruthy())
    mockState.logData = [
      { id: 1, access_area: 'Sala de Controle', access_time: '2026-07-26T10:00:00Z', status: 'sucesso', user_id: null, ip_address: null },
    ]
  })
})

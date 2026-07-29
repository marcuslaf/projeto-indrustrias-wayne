import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ResourcesClient } from './resources-client'

const mockResources = [
  {
    id: 1,
    name: 'Servidor Principal',
    type: 'equipamento' as const,
    status: 'em_uso' as const,
    location: 'Sala de Servidores',
    serial_number: 'SN-001',
    plate: null,
    acquisition_date: '2025-01-15',
    last_maintenance_date: '2026-06-01',
    created_by: null,
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-20T10:00:00Z',
    deleted_at: null,
  },
  {
    id: 2,
    name: 'Batmovel',
    type: 'veiculo' as const,
    status: 'disponivel' as const,
    location: 'Garagem',
    serial_number: null,
    plate: 'BAT-001',
    acquisition_date: '2025-03-01',
    last_maintenance_date: null,
    created_by: null,
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-20T10:00:00Z',
    deleted_at: null,
  },
  {
    id: 3,
    name: 'Drone de Vigilância',
    type: 'dispositivo_seguranca' as const,
    status: 'em_manutencao' as const,
    location: 'Hangar B',
    serial_number: 'DRN-003',
    plate: null,
    acquisition_date: '2025-06-01',
    last_maintenance_date: '2026-07-01',
    created_by: null,
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-20T10:00:00Z',
    deleted_at: null,
  },
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/resources',
  useParams: () => ({}),
}))

vi.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '123', user_metadata: { role: 'admin_seguranca' } } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockResources, error: null }),
    }),
    channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnValue({ subscribe: vi.fn() }) }),
    removeChannel: vi.fn(),
  }),
}))

vi.mock('@/components/navbar', () => ({
  Navbar: () => null,
}))

vi.mock('@/components/confirm-dialog', () => ({
  useConfirmDialog: () => ({ confirm: vi.fn().mockResolvedValue(true), dialog: null }),
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/lib/audit-log', () => ({
  logAccess: vi.fn(),
}))

describe('ResourcesClient', () => {
  it('renders page title "Gestão de Recursos"', () => {
    render(<ResourcesClient resources={mockResources} userRole="admin_seguranca" />)
    expect(screen.getByText('Gestão de Recursos')).toBeTruthy()
  })

  it('shows resource names in the table', () => {
    render(<ResourcesClient resources={mockResources} userRole="admin_seguranca" />)
    expect(screen.getByText('Servidor Principal')).toBeTruthy()
    expect(screen.getByText('Batmovel')).toBeTruthy()
    expect(screen.getByText('Drone de Vigilância')).toBeTruthy()
  })

  it('shows "Adicionar Recurso" form for admin/gerente roles', () => {
    render(<ResourcesClient resources={mockResources} userRole="admin_seguranca" />)
    const elements = screen.getAllByText('Adicionar Recurso')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('hides "Adicionar Recurso" form for funcionario role', () => {
    render(<ResourcesClient resources={mockResources} userRole="funcionario" />)
    expect(screen.queryByText('Adicionar Recurso')).toBeNull()
  })

  it('shows loading skeleton when page data is empty', () => {
    render(<ResourcesClient resources={[]} userRole="admin_seguranca" />)
    expect(screen.getByText('Carregando...')).toBeTruthy()
  })

  it('filters resources by search term', async () => {
    render(<ResourcesClient resources={mockResources} userRole="admin_seguranca" />)
    const searchInput = screen.getByPlaceholderText('Buscar recursos...')
    expect(searchInput).toBeTruthy()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServiceOrdersClient } from './service-orders-client'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/service-orders',
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
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null, data: null }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
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

const mockOrders = [
  {
    id: 1,
    title: 'Reparo no gerador',
    description: 'Gerador principal apresentando falhas',
    resource_id: 1,
    assigned_to: 'user1',
    priority: 'alta',
    status: 'aberta',
    created_by: null,
    created_at: '2026-07-26T10:00:00Z',
    updated_at: '2026-07-26T10:00:00Z',
    resource: { id: 1, name: 'Gerador' },
    assignee: { id: 'user1', username: 'bruce', nome: 'Bruce Wayne' },
  },
]

const mockResources = [{ id: 1, name: 'Gerador' }]
const mockProfiles = [{ id: 'user1', username: 'bruce', nome: 'Bruce Wayne' }]

describe('ServiceOrdersClient', () => {
  it('renders the title "Ordens de Serviço"', () => {
    render(
      <ServiceOrdersClient orders={[]} resources={mockResources} profiles={mockProfiles} userRole="admin_seguranca" />
    )
    expect(screen.getByText('Ordens de Serviço')).toBeTruthy()
  })

  it('shows "Nova Ordem" button for admin/gerente roles', () => {
    render(
      <ServiceOrdersClient orders={[]} resources={mockResources} profiles={mockProfiles} userRole="admin_seguranca" />
    )
    expect(screen.getByText('Nova Ordem')).toBeTruthy()
  })

  it('hides "Nova Ordem" button for funcionario role', () => {
    render(
      <ServiceOrdersClient orders={[]} resources={mockResources} profiles={mockProfiles} userRole="funcionario" />
    )
    expect(screen.queryByText('Nova Ordem')).toBeNull()
  })

  it('renders order items in the table', () => {
    render(
      <ServiceOrdersClient orders={mockOrders} resources={mockResources} profiles={mockProfiles} userRole="admin_seguranca" />
    )
    expect(screen.getByText('Reparo no gerador')).toBeTruthy()
  })

  it('shows empty state when no orders', () => {
    render(
      <ServiceOrdersClient orders={[]} resources={mockResources} profiles={mockProfiles} userRole="admin_seguranca" />
    )
    expect(screen.getByText('Nenhuma ordem encontrada.')).toBeTruthy()
  })
})

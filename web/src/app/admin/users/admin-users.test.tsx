import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminUsersClient } from './admin-users-client'

const mockProfiles = [
  {
    id: 'user-1',
    username: 'bruce',
    role: 'admin_seguranca',
    nome: 'Bruce Wayne',
    email: 'bruce@wayne.internal',
  },
  {
    id: 'user-2',
    username: 'alfred',
    role: 'funcionario',
    nome: 'Alfred Pennyworth',
    email: 'alfred@wayne.internal',
  },
  {
    id: 'user-3',
    username: 'lucius',
    role: 'gerente',
    nome: 'Lucius Fox',
    email: null,
  },
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/admin/users',
  useParams: () => ({}),
}))

vi.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      order: vi.fn().mockReturnThis(),
    }),
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

describe('AdminUsersClient', () => {
  it('renders page title "Gestão de Usuários"', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('Gestão de Usuários')).toBeTruthy()
  })

  it('shows user list with usernames', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('bruce')).toBeTruthy()
    expect(screen.getByText('alfred')).toBeTruthy()
    expect(screen.getByText('lucius')).toBeTruthy()
  })

  it('shows user names in the table', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('Bruce Wayne')).toBeTruthy()
    expect(screen.getByText('Alfred Pennyworth')).toBeTruthy()
  })

  it('shows "Criar Novo Usuário" form for admin_seguranca', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('Criar Novo Usuário')).toBeTruthy()
  })

  it('shows "Criar Usuário" button for admin_seguranca', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('Criar Usuário')).toBeTruthy()
  })

  it('blocks access for non-admin roles', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="funcionario" />)
    expect(screen.getByText('Você não tem permissão para acessar esta página.')).toBeTruthy()
  })

  it('shows email fallback "-" when email is null', () => {
    render(<AdminUsersClient profiles={mockProfiles} userRole="admin_seguranca" />)
    expect(screen.getByText('-')).toBeTruthy()
  })
})

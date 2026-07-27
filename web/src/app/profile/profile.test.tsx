import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProfilePage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '123', user_metadata: { role: 'admin_seguranca' }, email: 'bruce@wayne.internal' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '123', username: 'bruce', nome: 'Bruce Wayne' },
            error: null,
          }),
        }),
      }),
    }),
    channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnValue({ subscribe: vi.fn() }) }),
    removeChannel: vi.fn(),
  }),
}))

vi.mock('@/components/navbar', () => ({
  Navbar: () => null,
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

describe('ProfilePage', () => {
  it('renders profile heading', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Meu Perfil')).toBeTruthy()
  })

  it('shows user name field', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Bruce Wayne')).toBeTruthy()
    })
  })

  it('shows username field', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('bruce')).toBeTruthy()
    })
  })

  it('renders password change section', () => {
    render(<ProfilePage />)
    expect(screen.getAllByText('Alterar Senha').length).toBe(2)
  })
})

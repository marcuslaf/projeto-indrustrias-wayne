import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn(),
  }),
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

describe('LoginPage', () => {
  it('renders login form with title', () => {
    render(<LoginPage />)
    expect(screen.getByText('Indústrias Wayne')).toBeTruthy()
  })

  it('has username input', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Usuário')).toBeTruthy()
  })

  it('has submit button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy()
  })
})

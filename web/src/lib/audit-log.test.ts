import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert, mockGetUser } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockGetUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
}))

vi.mock('./supabase-client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  }),
}))

import { logAccess } from './audit-log'

describe('logAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
  })

  it('calls supabase.from("access_logs").insert() with correct parameters', async () => {
    mockInsert.mockResolvedValue({ error: null })

    await logAccess('Área Restrita')

    expect(mockGetUser).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalledWith({
      access_area: 'Área Restrita',
      access_time: expect.any(String),
      status: 'sucesso',
      user_id: 'user-123',
    })
  })

  it('passes user_id as null when no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockInsert.mockResolvedValue({ error: null })

    await logAccess('Área Restrita', 'falha')

    expect(mockInsert).toHaveBeenCalledWith({
      access_area: 'Área Restrita',
      access_time: expect.any(String),
      status: 'falha',
      user_id: null,
    })
  })
})

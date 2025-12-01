import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

// Mock modules BEFORE any imports that use them
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('PATCH /api/admin/users/[userId]/role', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'lider' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 401 when user is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'employee' } } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'lider' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 401 when user is lider', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'lider' } } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'lider' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 400 for invalid role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'invalid_role' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid role')
  })

  it('returns 403 when admin tries to assign super_admin role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'super_admin' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Forbidden: Only Super Admins can assign Super Admin role')
  })

  it('allows admin to change role to student', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      role: 'employee',
    } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'employee' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.role).toBe('employee')
  })

  it('allows admin to change role to lider', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      role: 'lider',
    } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'lider' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { role: 'lider' },
    })
  })

  it('allows admin to change role to admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      role: 'admin',
    } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'admin' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(200)
  })

  it('allows super_admin to assign super_admin role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'super_admin' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      role: 'super_admin',
    } as any)

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'super_admin' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { role: 'super_admin' },
    })
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/admin/users/user-123/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'employee' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ userId: 'user-123' }) })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Error')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'

// Mock modules BEFORE any imports that use them
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('POST /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 401 when user is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'employee' } } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 401 when user is lider', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'lider' } } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 403 when admin tries to create super_admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Super Admin',
        email: 'super@test.com',
        password: 'password',
        role: 'super_admin',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Forbidden: Only Super Admins can create Super Admins')
  })

  it('returns 400 when user already exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '2', email: 'test@test.com' } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('User already exists')
  })

  it('creates user successfully as admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashed_password',
      role: 'employee',
    } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('123')
    expect(data.password).toBeUndefined()
  })

  it('creates user with specified role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: 'Instructor',
      email: 'lider@test.com',
      password: 'hashed_password',
      role: 'lider',
    } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Instructor',
        email: 'lider@test.com',
        password: 'password',
        role: 'lider',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: 'lider' }),
    })
  })

  it('allows super_admin to create super_admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'super_admin' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: 'New Super Admin',
      email: 'newsuperadmin@test.com',
      password: 'hashed_password',
      role: 'super_admin',
    } as any)

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Super Admin',
        email: 'newsuperadmin@test.com',
        password: 'password',
        role: 'super_admin',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Error')
  })
})

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/admin/users')

    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 401 when user is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'employee' } } as any)

    const request = new Request('http://localhost/api/admin/users')

    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns users list for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: '1',
        name: 'User 1',
        email: 'user1@test.com',
        role: 'employee',
        createdAt: new Date(),
        _count: { enrollments: 2, coursesCreated: 0 },
      },
      {
        id: '2',
        name: 'User 2',
        email: 'user2@test.com',
        role: 'lider',
        createdAt: new Date(),
        _count: { enrollments: 0, coursesCreated: 5 },
      },
    ] as any)

    const request = new Request('http://localhost/api/admin/users')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0].name).toBe('User 1')
    expect(data[1]._count.coursesCreated).toBe(5)
  })

  it('returns users for super_admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'super_admin' } } as any)
    vi.mocked(prisma.user.findMany).mockResolvedValue([])

    const request = new Request('http://localhost/api/admin/users')

    const response = await GET(request)

    expect(response.status).toBe(200)
  })

  it('queries users ordered by createdAt desc', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findMany).mockResolvedValue([])

    const request = new Request('http://localhost/api/admin/users')

    await GET(request)

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            coursesCreated: true,
          },
        },
      },
    })
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'admin' } } as any)
    vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/admin/users')

    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Error')
  })
})

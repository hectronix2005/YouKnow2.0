import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock modules BEFORE any imports that use them
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { prisma } from '@/lib/db'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when name is missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 when email is missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', password: 'password' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 when password is missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 when user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'test@test.com' } as any)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('User already exists')
  })

  it('creates user successfully with default role', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@test.com',
      role: 'employee',
    } as any)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')
    expect(data.userId).toBe('123')
  })

  it('ignores client-provided role and always sets employee (security)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@test.com',
      role: 'employee',
    } as any)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'admin', // Client tries to set admin role
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    // Verify that role was always set to 'employee', ignoring client input
    expect(vi.mocked(prisma.user.create)).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: 'employee',
      }),
    })
  })

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('returns 400 for password too short', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        password: 'short',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must be at least 8 characters')
  })

  it('returns 400 for name too short', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'A',
        email: 'test@test.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name must be between 2 and 100 characters')
  })

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})

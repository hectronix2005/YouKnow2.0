import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock modules BEFORE any imports that use them
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    course: {
      create: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('POST /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Course' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when user is not a teacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: '1', role: 'employee' } } as any)

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Course' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('creates course when user is lider', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.create).mockResolvedValue({
      id: 'course-123',
      title: 'Test Course',
      slug: 'test-course-1234',
      instructorId: 'user-123',
    } as any)

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Course' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.title).toBe('Test Course')
    expect(prisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Test Course',
        instructorId: 'user-123',
        description: 'No description yet',
        category: 'Uncategorized',
        level: 'Beginner',
        isFree: true,
        price: 0,
      }),
    })
  })

  it('creates course when user is admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-123', role: 'admin' } } as any)
    vi.mocked(prisma.course.create).mockResolvedValue({
      id: 'course-456',
      title: 'Admin Course',
      instructorId: 'admin-123',
    } as any)

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Admin Course' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('creates course when user is super_admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'super-123', role: 'super_admin' } } as any)
    vi.mocked(prisma.course.create).mockResolvedValue({
      id: 'course-789',
      title: 'Super Admin Course',
      instructorId: 'super-123',
    } as any)

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Super Admin Course' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('generates slug from title', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.create).mockImplementation(async ({ data }: any) => ({
      ...data,
      id: 'course-123',
    }))

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'My Amazing Course!' }),
    })

    await POST(request)

    expect(prisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: expect.stringMatching(/^my-amazing-course-\d{4}$/),
      }),
    })
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.create).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Course' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock modules BEFORE any imports that use them
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    course: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('POST /api/courses/[courseId]/publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 404 when course is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Not Found')
  })

  it('returns 401 when user is not lider or admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'employee' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'other-user',
    } as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns 400 for invalid status', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'invalid' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid status')
  })

  it('publishes course successfully', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.status).toBe('published')
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course-123' },
      data: {
        status: 'published',
        publishedAt: expect.any(Date),
      },
    })
  })

  it('sets draft status and clears publishedAt', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'draft' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('draft')
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course-123' },
      data: {
        status: 'draft',
        publishedAt: null,
      },
    })
  })

  it('allows admin to publish any course', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-123', role: 'admin' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'other-user',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(200)
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/courses/course-123/publish', {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    })

    const response = await POST(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal Error')
  })
})

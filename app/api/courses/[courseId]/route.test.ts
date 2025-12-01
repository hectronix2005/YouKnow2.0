import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

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
    module: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    lesson: {
      create: vi.fn(),
    },
    lessonQuiz: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('PATCH /api/courses/[courseId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when course is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Course not found')
  })

  it('returns 403 when user is not the instructor or admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'other-user',
    } as any)

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('allows admin to update any course', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-123', role: 'admin' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'other-user',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)
    vi.mocked(prisma.module.findMany).mockResolvedValue([])
    vi.mocked(prisma.lessonQuiz.findMany).mockResolvedValue([])

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title', modules: [] }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('allows instructor to update their own course', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)
    vi.mocked(prisma.module.findMany).mockResolvedValue([])
    vi.mocked(prisma.lessonQuiz.findMany).mockResolvedValue([])

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({
        title: 'Updated Title',
        description: 'Updated Description',
        price: 100,
        category: 'Programming',
        modules: [],
      }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(200)
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course-123' },
      data: {
        title: 'Updated Title',
        description: 'Updated Description',
        price: 100,
        category: 'Programming',
      },
    })
  })

  it('creates modules and lessons', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)
    vi.mocked(prisma.module.findMany).mockResolvedValue([])
    vi.mocked(prisma.lessonQuiz.findMany).mockResolvedValue([])
    vi.mocked(prisma.module.create).mockResolvedValue({ id: 'module-1' } as any)
    vi.mocked(prisma.lesson.create).mockResolvedValue({ id: 'lesson-1' } as any)

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({
        title: 'Updated Title',
        modules: [
          {
            title: 'Module 1',
            lessons: [
              {
                title: 'Lesson 1',
                description: 'Description',
                lessonType: 'video',
                videoUrl: 'http://example.com/video',
                videoDuration: '300',
                isPreview: true,
              },
            ],
          },
        ],
      }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(200)
    expect(prisma.module.create).toHaveBeenCalled()
    expect(prisma.lesson.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Lesson 1',
        moduleId: 'module-1',
        videoDuration: 300,
        isPreview: true,
      }),
    })
  })

  it('preserves quizzes when updating modules', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockResolvedValue({
      id: 'course-123',
      instructorId: 'user-123',
    } as any)
    vi.mocked(prisma.course.update).mockResolvedValue({} as any)
    vi.mocked(prisma.module.findMany).mockResolvedValue([
      {
        id: 'old-module',
        lessons: [{ id: 'old-lesson', title: 'Lesson 1' }],
      },
    ] as any)
    vi.mocked(prisma.lessonQuiz.findMany).mockResolvedValue([
      { id: 'quiz-1', lessonId: 'old-lesson', questions: '[]' },
    ] as any)
    vi.mocked(prisma.module.create).mockResolvedValue({ id: 'new-module' } as any)
    vi.mocked(prisma.lesson.create).mockResolvedValue({ id: 'new-lesson' } as any)

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({
        modules: [
          {
            title: 'New Module',
            lessons: [{ title: 'Lesson 1' }],
          },
        ],
      }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })

    expect(response.status).toBe(200)
    expect(prisma.lessonQuiz.create).toHaveBeenCalledWith({
      data: {
        lessonId: 'new-lesson',
        questions: '[]',
      },
    })
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123', role: 'lider' } } as any)
    vi.mocked(prisma.course.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new Request('http://localhost/api/courses/course-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ courseId: 'course-123' }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock modules BEFORE any imports that use them
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    lesson: {
      findUnique: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
    },
    lessonQuiz: {
      findUnique: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('POST /api/quiz/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when lessonId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Lesson ID is required')
  })

  it('returns 404 when lesson is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Lesson not found')
  })

  it('returns 403 when user is not enrolled and not lider', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: {
        courseId: 'course-123',
        course: { instructorId: 'other-user' },
      },
    } as any)
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Not enrolled in this course')
  })

  it('returns existing quiz when found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: {
        courseId: 'course-123',
        course: { instructorId: 'user-123' },
      },
    } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([{ id: '1', question: 'Test?' }]),
      generatedAt: new Date(),
    } as any)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.quiz.id).toBe('quiz-123')
    expect(data.quiz.questions).toEqual([{ id: '1', question: 'Test?' }])
  })

  it('returns null when no quiz found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: {
        courseId: 'course-123',
        course: { instructorId: 'user-123' },
      },
    } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.quiz).toBeNull()
    expect(data.message).toBe('No quiz found for this lesson')
  })

  it('allows enrolled employee to access quiz', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'employee-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: {
        courseId: 'course-123',
        course: { instructorId: 'lider-123' },
      },
    } as any)
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({
      userId: 'employee-123',
      courseId: 'course-123',
    } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 500 on error with error message', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })

  it('returns 500 with generic message on non-Error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockRejectedValue('Unknown error')

    const request = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch quiz')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from './route'
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
    lessonQuiz: {
      upsert: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('PUT /api/quiz/update', () => {
  const validQuestions = Array.from({ length: 10 }, (_, i) => ({
    id: `q${i}`,
    question: `Question ${i}?`,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when lessonId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Lesson ID is required')
  })

  it('returns 400 when questions is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Questions array is required')
  })

  it('returns 400 when questions is not an array', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: 'not-array' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Questions array is required')
  })

  it('returns 400 when less than 10 questions', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: [validQuestions[0]] }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Se requieren al menos 10 preguntas')
  })

  it('returns 404 when lesson is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Lesson not found')
  })

  it('returns 403 when user is not the instructor', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: {
        course: { instructorId: 'other-user' },
      },
    } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only the course instructor can edit quizzes')
  })

  it('returns 400 when question text is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)

    const invalidQuestions = validQuestions.map((q, i) =>
      i === 0 ? { ...q, question: undefined } : q
    )

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: invalidQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Each question must have a question text')
  })

  it('returns 400 when options is not exactly 4', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)

    const invalidQuestions = validQuestions.map((q, i) =>
      i === 0 ? { ...q, options: ['A', 'B'] } : q
    )

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: invalidQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Each question must have exactly 4 options')
  })

  it('returns 400 when correctIndex is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)

    const invalidQuestions = validQuestions.map((q, i) =>
      i === 0 ? { ...q, correctIndex: 5 } : q
    )

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: invalidQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Each question must have a valid correctIndex (0-3)')
  })

  it('returns 400 when correctIndex is negative', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)

    const invalidQuestions = validQuestions.map((q, i) =>
      i === 0 ? { ...q, correctIndex: -1 } : q
    )

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: invalidQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Each question must have a valid correctIndex (0-3)')
  })

  it('creates quiz successfully', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)
    vi.mocked(prisma.lessonQuiz.upsert).mockResolvedValue({
      id: 'quiz-123',
      lessonId: 'lesson-123',
      updatedAt: new Date(),
    } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.quiz.id).toBe('quiz-123')
    expect(data.quiz.questions).toEqual(validQuestions)
  })

  it('upserts quiz correctly', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: 'lesson-123',
      module: { course: { instructorId: 'user-123' } },
    } as any)
    vi.mocked(prisma.lessonQuiz.upsert).mockResolvedValue({
      id: 'quiz-123',
      updatedAt: new Date(),
    } as any)

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    await PUT(request)

    expect(prisma.lessonQuiz.upsert).toHaveBeenCalledWith({
      where: { lessonId: 'lesson-123' },
      update: {
        questions: JSON.stringify(validQuestions),
        updatedAt: expect.any(Date),
      },
      create: {
        lessonId: 'lesson-123',
        questions: JSON.stringify(validQuestions),
      },
    })
  })

  it('returns 500 on error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lesson.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/quiz/update', {
      method: 'PUT',
      body: JSON.stringify({ lessonId: 'lesson-123', questions: validQuestions }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })
})

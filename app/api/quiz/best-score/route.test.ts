import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock modules BEFORE any imports that use them
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    lessonQuiz: {
      findUnique: vi.fn(),
    },
    quizAttempt: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('GET /api/quiz/best-score', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when lessonId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/best-score')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Lesson ID is required')
  })

  it('returns hasQuiz false when no quiz exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hasQuiz).toBe(false)
    expect(data.bestScore).toBeNull()
    expect(data.passed).toBe(false)
  })

  it('returns best score when quiz and attempts exist', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({ id: 'quiz-123' } as any)
    vi.mocked(prisma.quizAttempt.findFirst).mockResolvedValue({ score: 85 } as any)
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(3)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hasQuiz).toBe(true)
    expect(data.bestScore).toBe(85)
    expect(data.passed).toBe(false)
    expect(data.attempts).toBe(3)
  })

  it('returns passed true when best score is 100', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({ id: 'quiz-123' } as any)
    vi.mocked(prisma.quizAttempt.findFirst).mockResolvedValue({ score: 100 } as any)
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(2)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.passed).toBe(true)
  })

  it('returns null bestScore when no attempts', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({ id: 'quiz-123' } as any)
    vi.mocked(prisma.quizAttempt.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hasQuiz).toBe(true)
    expect(data.bestScore).toBeNull()
    expect(data.passed).toBe(false)
    expect(data.attempts).toBe(0)
  })

  it('queries for best score correctly', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({ id: 'quiz-123' } as any)
    vi.mocked(prisma.quizAttempt.findFirst).mockResolvedValue({ score: 75 } as any)
    vi.mocked(prisma.quizAttempt.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    await GET(request)

    expect(prisma.quizAttempt.findFirst).toHaveBeenCalledWith({
      where: {
        lessonQuizId: 'quiz-123',
        userId: 'user-123',
      },
      orderBy: {
        score: 'desc',
      },
    })
  })

  it('returns 500 on error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/quiz/best-score?lessonId=lesson-123')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to get quiz score')
  })
})

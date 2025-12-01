import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
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
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

// Import mocked modules to access them
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('POST /api/quiz/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: 'quiz-123', answers: [] }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when quizId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers: [] }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Quiz ID and answers are required')
  })

  it('returns 400 when answers is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: 'quiz-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Quiz ID and answers are required')
  })

  it('returns 400 when answers is not an array', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: 'quiz-123', answers: 'not-array' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Quiz ID and answers are required')
  })

  it('returns 404 when quiz is not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: 'quiz-123', answers: [] }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Quiz not found')
  })

  it('calculates score correctly - all correct', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([
        { id: 'q1', correctIndex: 0, explanation: 'Explanation 1' },
        { id: 'q2', correctIndex: 1, explanation: 'Explanation 2' },
      ]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [
          { questionId: 'q1', selectedIndex: 0 },
          { questionId: 'q2', selectedIndex: 1 },
        ],
        timeSpent: 120,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.result.score).toBe(100)
    expect(data.result.correctAnswers).toBe(2)
    expect(data.result.totalQuestions).toBe(2)
    expect(data.result.passed).toBe(true)
    expect(data.result.xpEarned).toBe(50)
  })

  it('calculates score correctly - partial correct', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([
        { id: 'q1', correctIndex: 0 },
        { id: 'q2', correctIndex: 1 },
        { id: 'q3', correctIndex: 2 },
        { id: 'q4', correctIndex: 3 },
      ]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [
          { questionId: 'q1', selectedIndex: 0 },
          { questionId: 'q2', selectedIndex: 0 }, // wrong
          { questionId: 'q3', selectedIndex: 2 },
          { questionId: 'q4', selectedIndex: 0 }, // wrong
        ],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.result.score).toBe(50)
    expect(data.result.correctAnswers).toBe(2)
    expect(data.result.passed).toBe(false)
    expect(data.result.xpEarned).toBe(0)
  })

  it('handles question not found in answers', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([
        { id: 'q1', correctIndex: 0 },
      ]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [
          { questionId: 'unknown', selectedIndex: 0 },
        ],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.result.detailedResults[0].correct).toBe(false)
    expect(data.result.detailedResults[0].explanation).toBe('Question not found')
  })

  it('awards XP when score >= 60', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([
        { id: 'q1', correctIndex: 0 },
        { id: 'q2', correctIndex: 0 },
        { id: 'q3', correctIndex: 0 },
      ]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [
          { questionId: 'q1', selectedIndex: 0 },
          { questionId: 'q2', selectedIndex: 0 },
          { questionId: 'q3', selectedIndex: 1 }, // wrong
        ],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.result.score).toBe(67)
    expect(data.result.passed).toBe(true)
    expect(data.result.xpEarned).toBe(30)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { xp: { increment: 30 } },
    })
  })

  it('does not award XP when score < 60', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([
        { id: 'q1', correctIndex: 0 },
        { id: 'q2', correctIndex: 0 },
      ]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [
          { questionId: 'q1', selectedIndex: 0 },
          { questionId: 'q2', selectedIndex: 1 }, // wrong
        ],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.result.score).toBe(50)
    expect(data.result.passed).toBe(false)
    expect(data.result.xpEarned).toBe(0)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('saves timeSpent in attempt', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      questions: JSON.stringify([{ id: 'q1', correctIndex: 0 }]),
    } as any)
    vi.mocked(prisma.quizAttempt.create).mockResolvedValue({ id: 'attempt-123' } as any)

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({
        quizId: 'quiz-123',
        answers: [{ questionId: 'q1', selectedIndex: 0 }],
        timeSpent: 300,
      }),
    })

    await POST(request)

    expect(prisma.quizAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ timeSpent: 300 }),
    })
  })

  it('returns 500 on error', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.lessonQuiz.findUnique).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: 'quiz-123', answers: [] }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { KahootQuiz } from './kahoot-quiz'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('KahootQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    expect(screen.getByText('Generando quiz...')).toBeInTheDocument()
  })

  it('shows error when quiz not found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText(/no está disponible/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows error when less than 10 questions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        quiz: {
          id: 'quiz-1',
          questions: Array(5).fill({
            id: 'q1',
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 0,
          }),
        },
      }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText(/no está completo/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows ready state with start button when quiz is valid', async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Question ${i}?`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { id: 'quiz-1', questions } }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Quiz: Test Lesson')).toBeInTheDocument()
      expect(screen.getByText('Comenzar Quiz')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows quiz info before starting', async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Question ${i}?`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { id: 'quiz-1', questions } }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('20 seg/pregunta')).toBeInTheDocument()
      expect(screen.getByText('Gana XP')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('starts quiz when button is clicked', async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Question ${i}?`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { id: 'quiz-1', questions } }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Comenzar Quiz')).toBeInTheDocument()
    }, { timeout: 3000 })

    await act(async () => {
      fireEvent.click(screen.getByText('Comenzar Quiz'))
    })

    await waitFor(() => {
      expect(screen.getByText(/Pregunta 1 de 5/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows question with options', async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Test Question ${i}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { id: 'quiz-1', questions } }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Comenzar Quiz')).toBeInTheDocument()
    }, { timeout: 3000 })

    await act(async () => {
      fireEvent.click(screen.getByText('Comenzar Quiz'))
    })

    await waitFor(() => {
      // Should show one of the questions and its options
      expect(screen.getByText(/Option A/)).toBeInTheDocument()
      expect(screen.getByText(/Option B/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows retry button on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Test error' }),
    })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('retries loading on retry button click', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quiz: null }),
      })

    render(<KahootQuiz lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument()
    }, { timeout: 3000 })

    await act(async () => {
      fireEvent.click(screen.getByText('Intentar de nuevo'))
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

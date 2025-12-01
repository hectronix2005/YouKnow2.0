import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { QuizEditor } from './quiz-editor'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('QuizEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    expect(screen.getByText('Cargando quiz...')).toBeInTheDocument()
  })

  it('shows empty state when no questions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('No hay preguntas aún.')).toBeInTheDocument()
      expect(screen.getByText('Agregar Primera Pregunta')).toBeInTheDocument()
    })
  })

  it('shows editor header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Editor de Quiz')).toBeInTheDocument()
      expect(screen.getByText('Test Lesson')).toBeInTheDocument()
    })
  })

  it('shows question counter', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('0/10 preguntas')).toBeInTheDocument()
    })
  })

  it('adds new question when button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Agregar Primera Pregunta')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Agregar Primera Pregunta'))
    })

    expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
    expect(screen.getByText('1/10 preguntas')).toBeInTheDocument()
  })

  it('shows existing questions when loaded', async () => {
    const questions = [
      {
        id: 'q1',
        question: 'Test Question 1?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Test explanation',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { questions } }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Question 1?')).toBeInTheDocument()
    })
  })

  it('disables save button when less than 10 questions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      const saveButton = screen.getByText('Guardar').closest('button')
      expect(saveButton).toBeDisabled()
    })
  })

  it('shows unsaved changes badge when modified', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Agregar Primera Pregunta')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Agregar Primera Pregunta'))
    })

    expect(screen.getByText('Sin guardar')).toBeInTheDocument()
  })

  it('shows info about quiz requirements', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText(/Crea mínimo 10 preguntas/)).toBeInTheDocument()
    })
  })

  it('deletes question when delete button is clicked', async () => {
    const questions = [
      {
        id: 'q1',
        question: 'Test Question?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { questions } }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: '' }) // Trash button
    await act(async () => {
      fireEvent.click(deleteButton)
    })

    expect(screen.queryByText('Pregunta 1')).not.toBeInTheDocument()
    expect(screen.getByText('0/10 preguntas')).toBeInTheDocument()
  })

  it('shows error when save fails validation', async () => {
    // Create 10 questions with one having empty options
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Question ${i}?`,
      options: i === 0 ? ['', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { questions } }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument()
    })

    const saveButton = screen.getByText('Guardar').closest('button')
    await act(async () => {
      fireEvent.click(saveButton!)
    })

    expect(screen.getByText(/opciones vacías/)).toBeInTheDocument()
  })

  it('shows success message when save succeeds', async () => {
    const questions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Question ${i}?`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }))

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quiz: { questions } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument()
    })

    const saveButton = screen.getByText('Guardar').closest('button')
    await act(async () => {
      fireEvent.click(saveButton!)
    })

    await waitFor(() => {
      expect(screen.getByText('Quiz guardado exitosamente')).toBeInTheDocument()
    })
  })

  it('updates question text', async () => {
    const questions = [
      {
        id: 'q1',
        question: 'Original question?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: { questions } }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Original question?')).toBeInTheDocument()
    })

    const textarea = screen.getByDisplayValue('Original question?')
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Updated question?' } })
    })

    expect(screen.getByDisplayValue('Updated question?')).toBeInTheDocument()
  })

  it('adds question with default correct answer', async () => {
    // Start with no quiz so we can add a question manually
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ quiz: null }),
    })

    render(<QuizEditor lessonId="lesson-1" lessonTitle="Test Lesson" />)

    // Wait for empty state and add a question
    await waitFor(() => {
      expect(screen.getByText('Agregar Primera Pregunta')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Agregar Primera Pregunta'))
    })

    // New question should be added with default options
    expect(screen.getByText('Pregunta 1')).toBeInTheDocument()
    // Check that options inputs exist with default values
    expect(screen.getByDisplayValue('Opción A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Opción B')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Opción C')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Opción D')).toBeInTheDocument()
  })
})

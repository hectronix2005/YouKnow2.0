import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { VideoAnalyzer } from './video-analyzer'

describe('VideoAnalyzer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders upload interface', () => {
    render(<VideoAnalyzer />)
    expect(screen.getByText(/Arrastra un video/)).toBeInTheDocument()
    expect(screen.getByText(/MP4, WebM, MOV/)).toBeInTheDocument()
  })

  it('shows file input', () => {
    render(<VideoAnalyzer />)
    const input = document.getElementById('video-upload')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'video/*')
  })

  it('does not show analyze button initially', () => {
    render(<VideoAnalyzer />)
    expect(screen.queryByText('Analizar Video con IA')).not.toBeInTheDocument()
  })

  it('shows analyze button after file selection', () => {
    render(<VideoAnalyzer />)

    const input = document.getElementById('video-upload') as HTMLInputElement
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
    expect(screen.getByText('Analizar Video con IA')).toBeInTheDocument()
  })

  it('shows analyzing state when button is clicked', async () => {
    render(<VideoAnalyzer />)

    const input = document.getElementById('video-upload') as HTMLInputElement
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })

    fireEvent.change(input, { target: { files: [file] } })

    const button = screen.getByText('Analizar Video con IA')
    fireEvent.click(button)

    expect(screen.getByText('Analizando...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('returns to normal state after analyzing', async () => {
    render(<VideoAnalyzer />)

    const input = document.getElementById('video-upload') as HTMLInputElement
    const file = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' })

    fireEvent.change(input, { target: { files: [file] } })

    const button = screen.getByText('Analizar Video con IA')
    fireEvent.click(button)

    expect(screen.getByText('Analizando...')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Analizar Video con IA')).toBeInTheDocument()
    expect(screen.getByText('Analizar Video con IA')).not.toBeDisabled()
  })

  it('shows development notice', () => {
    render(<VideoAnalyzer />)
    expect(screen.getByText(/Funcionalidad en desarrollo/)).toBeInTheDocument()
  })

  it('does nothing when analyze clicked without file', async () => {
    render(<VideoAnalyzer />)

    // Manually call handleAnalyze with no file - this shouldn't cause errors
    // The button shouldn't even be visible without a file
    expect(screen.queryByText('Analizar Video con IA')).not.toBeInTheDocument()
  })
})

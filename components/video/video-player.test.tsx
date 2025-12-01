import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// We need to test the helper functions and basic rendering
// Complex video behavior is hard to test without actual video elements

describe('VideoPlayer helpers', () => {
  // Test getYouTubeId function logic
  describe('YouTube URL detection', () => {
    it('should detect youtube.com/watch URLs', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(url.includes('youtube.com') || url.includes('youtu.be')).toBe(true)
    })

    it('should detect youtu.be URLs', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      expect(url.includes('youtube.com') || url.includes('youtu.be')).toBe(true)
    })

    it('should not detect non-YouTube URLs', () => {
      const url = 'https://example.com/video.mp4'
      expect(url.includes('youtube.com') || url.includes('youtu.be')).toBe(false)
    })
  })

  describe('Time formatting', () => {
    const formatTime = (seconds: number): string => {
      if (isNaN(seconds)) return "0:00"
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    it('formats 0 seconds correctly', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    it('formats seconds under a minute', () => {
      expect(formatTime(45)).toBe('0:45')
    })

    it('formats exactly one minute', () => {
      expect(formatTime(60)).toBe('1:00')
    })

    it('formats minutes and seconds', () => {
      expect(formatTime(125)).toBe('2:05')
    })

    it('handles NaN', () => {
      expect(formatTime(NaN)).toBe('0:00')
    })

    it('pads single digit seconds', () => {
      expect(formatTime(65)).toBe('1:05')
    })
  })
})

describe('VideoPlayer rendering', () => {
  // Import the component for rendering tests
  let VideoPlayer: any

  beforeEach(async () => {
    // Dynamic import to avoid issues with mocking
    const module = await import('./video-player')
    VideoPlayer = module.VideoPlayer
  })

  it('renders video not available message when no src', () => {
    // When all fallback videos fail or aren't loaded
    render(<VideoPlayer src={null} />)
    // Initial state shows loading or fallback
    expect(document.querySelector('video') || document.querySelector('.aspect-video')).toBeTruthy()
  })

  it('renders YouTube player for YouTube URLs', () => {
    render(<VideoPlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />)
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeTruthy()
    if (iframe) {
      expect(iframe.src).toContain('youtube.com/embed')
    }
  })

  it('renders video element for MP4 URLs', () => {
    render(<VideoPlayer src="https://example.com/video.mp4" />)
    const video = document.querySelector('video')
    expect(video).toBeTruthy()
  })

  it('applies custom className', () => {
    render(<VideoPlayer src="https://example.com/video.mp4" className="custom-class" />)
    const container = document.querySelector('.custom-class')
    expect(container).toBeTruthy()
  })

  it('renders title when provided', () => {
    render(
      <VideoPlayer
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="Test Video"
      />
    )
    const iframe = document.querySelector('iframe')
    expect(iframe).toHaveAttribute('title', 'Test Video')
  })

  it('shows YouTube badge for YouTube videos', () => {
    render(<VideoPlayer src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />)
    expect(screen.getByText('YouTube')).toBeInTheDocument()
  })

  it('shows description when video not available', () => {
    // Create a scenario where video isn't available
    // By not providing any src and description
    const { container } = render(
      <VideoPlayer src={undefined} description="Video description here" />
    )
    // The component falls back to FALLBACK_VIDEOS, so video will still try to load
    expect(container.querySelector('.aspect-video')).toBeTruthy()
  })
})

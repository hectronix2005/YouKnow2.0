import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from './toast-provider'

function TestComponent() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>Show Success</button>
      <button onClick={() => showToast('Error message', 'error')}>Show Error</button>
      <button onClick={() => showToast('Warning message', 'warning')}>Show Warning</button>
      <button onClick={() => showToast('Info message', 'info')}>Show Info</button>
      <button onClick={() => showToast('Custom duration', 'info', 1000)}>Short Toast</button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children correctly', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Success'))
    })

    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('shows error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Error'))
    })

    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('shows warning toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Warning'))
    })

    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('shows info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Info'))
    })

    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('auto-removes toast after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Short Toast'))
    })

    expect(screen.getByText('Custom duration')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.queryByText('Custom duration')).not.toBeInTheDocument()
  })

  it('closes toast when X button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Info'))
    })

    expect(screen.getByText('Info message')).toBeInTheDocument()

    // Find and click close button
    const closeButton = screen.getByRole('button', { name: '' })
    await act(async () => {
      fireEvent.click(closeButton)
    })

    expect(screen.queryByText('Info message')).not.toBeInTheDocument()
  })

  it('shows multiple toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Show Success'))
      fireEvent.click(screen.getByText('Show Error'))
    })

    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within ToastProvider')

    consoleSpy.mockRestore()
  })
})

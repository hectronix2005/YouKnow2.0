import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './progress'

describe('Progress', () => {
  it('renders correctly', () => {
    render(<Progress value={50} />)
    expect(document.querySelector('.bg-\\[\\#6366f1\\]')).toBeInTheDocument()
  })

  it('applies correct width based on value', () => {
    render(<Progress value={75} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]') as HTMLElement
    expect(progressBar).toHaveStyle({ width: '75%' })
  })

  it('clamps value to minimum of 0', () => {
    render(<Progress value={-10} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]') as HTMLElement
    expect(progressBar).toHaveStyle({ width: '0%' })
  })

  it('clamps value to maximum of 100', () => {
    render(<Progress value={150} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]') as HTMLElement
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('handles value of 0', () => {
    render(<Progress value={0} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]') as HTMLElement
    expect(progressBar).toHaveStyle({ width: '0%' })
  })

  it('handles value of 100', () => {
    render(<Progress value={100} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]') as HTMLElement
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('does not show label by default', () => {
    render(<Progress value={50} />)
    expect(screen.queryByText('50% complete')).not.toBeInTheDocument()
  })

  it('shows label when showLabel is true', () => {
    render(<Progress value={50} showLabel />)
    expect(screen.getByText('50% complete')).toBeInTheDocument()
  })

  it('shows correct label percentage', () => {
    render(<Progress value={33} showLabel />)
    expect(screen.getByText('33% complete')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Progress value={50} className="custom-class" />)
    const container = document.querySelector('.bg-gray-200')
    expect(container).toHaveClass('custom-class')
  })

  it('applies default track styles', () => {
    render(<Progress value={50} />)
    const track = document.querySelector('.bg-gray-200')
    expect(track).toHaveClass('h-2', 'w-full', 'overflow-hidden', 'rounded-full')
  })

  it('label shows clamped percentage for values over 100', () => {
    render(<Progress value={200} showLabel />)
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })

  it('label shows clamped percentage for negative values', () => {
    render(<Progress value={-50} showLabel />)
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('has transition styles on progress bar', () => {
    render(<Progress value={50} />)
    const progressBar = document.querySelector('.bg-\\[\\#6366f1\\]')
    expect(progressBar).toHaveClass('transition-all', 'duration-300', 'ease-out')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
  it('renders children correctly', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Label>Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('custom-label')
  })

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    )
    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('passes through additional props', () => {
    render(<Label data-testid="test-label">Label</Label>)
    expect(screen.getByTestId('test-label')).toBeInTheDocument()
  })

  it('renders with peer disabled styles class', () => {
    render(<Label>Disabled peer label</Label>)
    const label = screen.getByText('Disabled peer label')
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
  })
})

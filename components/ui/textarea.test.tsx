import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('flex', 'min-h-[60px]', 'w-full', 'rounded-md', 'border')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    fireEvent.change(textarea, { target: { value: 'test content' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('handles value prop', () => {
    render(<Textarea value="test value" readOnly data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveValue('test value')
  })

  it('can be disabled', () => {
    render(<Textarea disabled data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('has correct displayName', () => {
    expect(Textarea.displayName).toBe('Textarea')
  })

  it('passes through additional props', () => {
    render(<Textarea name="test-name" id="test-id" rows={5} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('name', 'test-name')
    expect(textarea).toHaveAttribute('id', 'test-id')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('handles focus events', () => {
    const handleFocus = vi.fn()
    render(<Textarea onFocus={handleFocus} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    fireEvent.focus(textarea)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('handles blur events', () => {
    const handleBlur = vi.fn()
    render(<Textarea onBlur={handleBlur} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    fireEvent.blur(textarea)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('renders as textarea element', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea.tagName).toBe('TEXTAREA')
  })
})

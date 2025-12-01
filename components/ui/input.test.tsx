import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-lg', 'border')
  })

  it('handles type prop', () => {
    render(<Input type="email" data-testid="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles text type', () => {
    render(<Input type="text" data-testid="text-input" />)
    const input = screen.getByTestId('text-input')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('handles password type', () => {
    render(<Input type="password" data-testid="password-input" />)
    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles number type', () => {
    render(<Input type="number" data-testid="number-input" />)
    const input = screen.getByTestId('number-input')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    const input = screen.getByTestId('input')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('handles value prop', () => {
    render(<Input value="test value" readOnly data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveValue('test value')
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('has correct displayName', () => {
    expect(Input.displayName).toBe('Input')
  })

  it('passes through additional props', () => {
    render(<Input name="test-name" id="test-id" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('name', 'test-name')
    expect(input).toHaveAttribute('id', 'test-id')
  })

  it('handles focus events', () => {
    const handleFocus = vi.fn()
    render(<Input onFocus={handleFocus} data-testid="input" />)
    const input = screen.getByTestId('input')
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('handles blur events', () => {
    const handleBlur = vi.fn()
    render(<Input onBlur={handleBlur} data-testid="input" />)
    const input = screen.getByTestId('input')
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })
})

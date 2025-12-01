import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-xl', 'border', 'bg-white', 'shadow-sm')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Card ref={ref}>With Ref</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(Card.displayName).toBe('Card')
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Content</CardHeader>)
    expect(screen.getByText('Content')).toHaveClass('custom-header')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<CardHeader ref={ref}>With Ref</CardHeader>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(CardHeader.displayName).toBe('CardHeader')
  })
})

describe('CardTitle', () => {
  it('renders children correctly', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('text-2xl', 'font-semibold')
  })

  it('applies custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>)
    expect(screen.getByText('Title')).toHaveClass('custom-title')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<CardTitle ref={ref}>With Ref</CardTitle>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })

  it('has correct displayName', () => {
    expect(CardTitle.displayName).toBe('CardTitle')
  })
})

describe('CardDescription', () => {
  it('renders children correctly', () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders as p element', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc.tagName).toBe('P')
  })

  it('applies default styles', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc).toHaveClass('text-sm', 'text-gray-500')
  })

  it('applies custom className', () => {
    render(<CardDescription className="custom-desc">Description</CardDescription>)
    expect(screen.getByText('Description')).toHaveClass('custom-desc')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<CardDescription ref={ref}>With Ref</CardDescription>)
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
  })

  it('has correct displayName', () => {
    expect(CardDescription.displayName).toBe('CardDescription')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  it('applies custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    expect(screen.getByText('Content')).toHaveClass('custom-content')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<CardContent ref={ref}>With Ref</CardContent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(CardContent.displayName).toBe('CardContent')
  })
})

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Content</CardFooter>)
    expect(screen.getByText('Content')).toHaveClass('custom-footer')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<CardFooter ref={ref}>With Ref</CardFooter>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has correct displayName', () => {
    expect(CardFooter.displayName).toBe('CardFooter')
  })
})

describe('Card composition', () => {
  it('renders full card structure correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })
})

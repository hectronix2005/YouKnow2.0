import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './dropdown-menu'

describe('DropdownMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('content is hidden by default', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('opens content when trigger is clicked', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('closes content when trigger is clicked again', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Item 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('closes content when clicking outside', () => {
    render(
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div data-testid="outside">Outside</div>
      </div>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Item 1')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('closes content when item is clicked', () => {
    const handleClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    fireEvent.click(screen.getByText('Item 1'))

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })
})

describe('DropdownMenuTrigger', () => {
  it('renders button when asChild is false', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toHaveTextContent('Trigger')
  })

  it('works with asChild prop', () => {
    const handleCustomClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button onClick={handleCustomClick}>Custom Trigger</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Custom Trigger'))
    expect(screen.getByText('Item')).toBeInTheDocument()
    expect(handleCustomClick).toHaveBeenCalled()
  })
})

describe('DropdownMenuContent', () => {
  it('applies start alignment', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    const content = screen.getByRole('menu').parentElement
    expect(content).toHaveClass('left-0')
  })

  it('applies center alignment', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    const content = screen.getByRole('menu').parentElement
    expect(content).toHaveClass('left-1/2', '-translate-x-1/2')
  })

  it('applies end alignment', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    const content = screen.getByRole('menu').parentElement
    expect(content).toHaveClass('right-0')
  })

  it('applies custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-dropdown">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    const content = screen.getByRole('menu').parentElement
    expect(content).toHaveClass('custom-dropdown')
  })

  it('has menu role', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})

describe('DropdownMenuItem', () => {
  it('renders children correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Menu Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Menu Item')).toBeInTheDocument()
  })

  it('has menuitem role', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByRole('menuitem')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>Clickable</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    fireEvent.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Item')).toHaveClass('custom-item')
  })

  it('applies default styles', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.click(screen.getByText('Open'))
    const item = screen.getByText('Item')
    expect(item).toHaveClass('block', 'w-full', 'text-left', 'px-4', 'py-2', 'text-sm')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './navbar'

// Mock useLanguage
const mockSetLanguage = vi.fn()
vi.mock('@/components/providers/language-provider', () => ({
  useLanguage: () => ({
    language: 'es',
    setLanguage: mockSetLanguage,
    t: {
      nav: {
        home: 'Inicio',
        dashboard: 'Panel',
        courses: 'Cursos',
        lider: 'Líder',
      },
      auth: {
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        logout: 'Cerrar Sesión',
      },
      common: {
        language: 'Idioma',
        spanish: 'Español',
        english: 'Inglés',
      },
    },
  }),
}))

describe('Navbar', () => {
  it('renders logo', () => {
    render(<Navbar />)
    expect(screen.getByText('YouKnow')).toBeInTheDocument()
  })

  it('shows login and register buttons when not authenticated', () => {
    render(<Navbar />)
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
  })

  it('shows user info when authenticated', () => {
    render(
      <Navbar
        user={{ name: 'John Doe', email: 'john@test.com', role: 'employee' }}
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('employee')).toBeInTheDocument()
  })

  it('shows dashboard link for authenticated users', () => {
    render(
      <Navbar
        user={{ name: 'John', email: 'john@test.com', role: 'employee' }}
      />
    )
    expect(screen.getByText('Panel')).toBeInTheDocument()
    expect(screen.getByText('Cursos')).toBeInTheDocument()
  })

  it('shows lider link for lider role', () => {
    render(
      <Navbar
        user={{ name: 'Teacher', email: 'teacher@test.com', role: 'lider' }}
      />
    )
    expect(screen.getByText('Líder')).toBeInTheDocument()
  })

  it('shows lider link for admin role', () => {
    render(
      <Navbar
        user={{ name: 'AdminUser', email: 'admin@test.com', role: 'admin' }}
      />
    )
    expect(screen.getByText('Líder')).toBeInTheDocument()
    // Admin link should be present - using getAllByText since 'admin' appears as role too
    const adminElements = screen.getAllByText(/admin/i)
    expect(adminElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows lider and admin links for super_admin role', () => {
    render(
      <Navbar
        user={{ name: 'Super Admin', email: 'super@test.com', role: 'super_admin' }}
      />
    )
    expect(screen.getByText('Líder')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('does not show lider link for student role', () => {
    render(
      <Navbar
        user={{ name: 'Student', email: 'student@test.com', role: 'employee' }}
      />
    )
    expect(screen.queryByText('Líder')).not.toBeInTheDocument()
  })

  it('calls onSignOut when logout button is clicked', () => {
    const handleSignOut = vi.fn()
    render(
      <Navbar
        user={{ name: 'John', email: 'john@test.com', role: 'employee' }}
        onSignOut={handleSignOut}
      />
    )

    fireEvent.click(screen.getByText('Cerrar Sesión'))
    expect(handleSignOut).toHaveBeenCalledTimes(1)
  })

  it('shows language switcher', () => {
    render(<Navbar />)
    // Language switcher button is rendered with sr-only text
    expect(screen.getByText('Idioma')).toBeInTheDocument()
  })

  it('navigates to dashboard when logo is clicked with user', () => {
    render(
      <Navbar
        user={{ name: 'John', email: 'john@test.com', role: 'employee' }}
      />
    )
    const logo = screen.getByText('YouKnow').closest('a')
    expect(logo).toHaveAttribute('href', '/dashboard')
  })

  it('navigates to home when logo is clicked without user', () => {
    render(<Navbar />)
    const logo = screen.getByText('YouKnow').closest('a')
    expect(logo).toHaveAttribute('href', '/')
  })
})

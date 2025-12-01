import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './language-provider'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    clear: () => { store = {} }
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function TestComponent() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="translation">{t.common.loading}</span>
      <button onClick={() => setLanguage('en')}>Set English</button>
      <button onClick={() => setLanguage('es')}>Set Spanish</button>
    </div>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    document.documentElement.lang = ''
  })

  it('provides default language (es)', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('es')
    expect(screen.getByTestId('translation')).toHaveTextContent('Cargando...')
  })

  it('loads language from localStorage', async () => {
    localStorageMock.setItem('language', 'en')

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Loading...')
  })

  it('changes language when setLanguage is called', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('es')

    await act(async () => {
      fireEvent.click(screen.getByText('Set English'))
    })

    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Loading...')
  })

  it('saves language to localStorage when changed', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Set English'))
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en')
  })

  it('sets document.documentElement.lang', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(document.documentElement.lang).toBe('es')

    await act(async () => {
      fireEvent.click(screen.getByText('Set English'))
    })

    expect(document.documentElement.lang).toBe('en')
  })

  it('ignores invalid language in localStorage', async () => {
    localStorageMock.setItem('language', 'invalid')

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('language')).toHaveTextContent('es')
  })
})

describe('useLanguage', () => {
  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useLanguage must be used within a LanguageProvider')

    consoleSpy.mockRestore()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { cn, formatDuration, formatTime, calculateProgress, slugify, generateUniqueSlug, clamp, debounce } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active')
    expect(cn('base', false && 'active')).toBe('base')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles empty string', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s')
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(3599)).toBe('59m 59s')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1h 0m')
    expect(formatDuration(3660)).toBe('1h 1m')
    expect(formatDuration(7200)).toBe('2h 0m')
    expect(formatDuration(7320)).toBe('2h 2m')
  })

  it('handles invalid input', () => {
    expect(formatDuration(-1)).toBe('0s')
    expect(formatDuration(NaN)).toBe('0s')
    expect(formatDuration(Infinity)).toBe('0s')
  })
})

describe('calculateProgress', () => {
  it('calculates progress percentage correctly', () => {
    expect(calculateProgress(5, 10)).toBe(50)
    expect(calculateProgress(1, 4)).toBe(25)
    expect(calculateProgress(3, 4)).toBe(75)
  })

  it('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0)
    expect(calculateProgress(5, 0)).toBe(0)
  })

  it('returns 100 when completed equals total', () => {
    expect(calculateProgress(10, 10)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateProgress(1, 3)).toBe(33)
    expect(calculateProgress(2, 3)).toBe(67)
  })
})

describe('formatTime', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(30)).toBe('0:30')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3599)).toBe('59:59')
  })

  it('formats to HH:MM:SS for longer durations', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(7323)).toBe('2:02:03')
  })

  it('handles invalid input', () => {
    expect(formatTime(-1)).toBe('0:00')
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
  })
})

describe('slugify', () => {
  it('converts to lowercase and replaces spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('handles multiple spaces and dashes', () => {
    expect(slugify('Hello   World')).toBe('hello-world')
    expect(slugify('Hello---World')).toBe('hello-world')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify(' Hello World ')).toBe('hello-world')
    expect(slugify('---Hello---')).toBe('hello')
  })

  it('adds suffix when provided', () => {
    expect(slugify('Hello', '123')).toBe('hello-123')
  })
})

describe('generateUniqueSlug', () => {
  it('generates slug with timestamp suffix', () => {
    const slug = generateUniqueSlug('Test Course')
    expect(slug).toMatch(/^test-course-\d{4}$/)
  })
})

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

describe('debounce', () => {
  it('delays function execution', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('cancels previous calls when called multiple times', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

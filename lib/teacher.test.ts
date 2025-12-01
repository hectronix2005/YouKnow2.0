import { describe, it, expect } from 'vitest'
import { isLeader, isAdmin, isSuperAdmin } from './teacher'

describe('isLeader', () => {
  it('returns true for lider role', () => {
    expect(isLeader('lider')).toBe(true)
  })

  it('returns true for admin role', () => {
    expect(isLeader('admin')).toBe(true)
  })

  it('returns true for super_admin role', () => {
    expect(isLeader('super_admin')).toBe(true)
  })

  it('returns false for employee role', () => {
    expect(isLeader('employee')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isLeader(undefined)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isLeader(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isLeader('')).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(isLeader('unknown')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('returns true for super_admin role', () => {
    expect(isAdmin('super_admin')).toBe(true)
  })

  it('returns false for lider role', () => {
    expect(isAdmin('lider')).toBe(false)
  })

  it('returns false for employee role', () => {
    expect(isAdmin('employee')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAdmin('')).toBe(false)
  })
})

describe('isSuperAdmin', () => {
  it('returns true for super_admin role', () => {
    expect(isSuperAdmin('super_admin')).toBe(true)
  })

  it('returns false for admin role', () => {
    expect(isSuperAdmin('admin')).toBe(false)
  })

  it('returns false for lider role', () => {
    expect(isSuperAdmin('lider')).toBe(false)
  })

  it('returns false for employee role', () => {
    expect(isSuperAdmin('employee')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isSuperAdmin(undefined)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isSuperAdmin(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isSuperAdmin('')).toBe(false)
  })
})

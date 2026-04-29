/**
 * Regression tests for src/services/api.js error extraction.
 * Phase 1 root cause: backend returns { error: 'string' } but the old code
 * tried errorData.error?.message (undefined on strings) and fell back to
 * a generic message, silently swallowing all backend error info.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// We test the raw request() behavior by importing api and mocking fetch
let api

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

async function importApi() {
  // Dynamic import to get a fresh module each time
  const mod = await import('../services/api.js')
  return mod.default
}

describe('API error extraction', () => {
  it('propagates backend error when error field is a string', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Cet email est déjà utilisé' }),
      })
    ))

    const api = await importApi()

    await expect(api.auth.register({ email: 'a@b.com', password: '12345678' }))
      .rejects.toThrow('Cet email est déjà utilisé')
  })

  it('propagates backend error when error field is an object with message', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Validation failed' } }),
      })
    ))

    const api = await importApi()

    await expect(api.auth.login({ email: 'a@b.com', password: 'x' }))
      .rejects.toThrow('Validation failed')
  })

  it('propagates backend error from message field', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      })
    ))

    const api = await importApi()

    await expect(api.auth.login({ email: 'a@b.com', password: 'x' }))
      .rejects.toThrow('Internal server error')
  })

  it('falls back to generic message when no error info', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    ))

    const api = await importApi()

    await expect(api.auth.login({ email: 'a@b.com', password: 'x' }))
      .rejects.toThrow('Une erreur est survenue')
  })
})

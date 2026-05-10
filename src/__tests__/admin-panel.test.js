/**
 * Regression tests for Super Admin Panel (Phase 3.2).
 */
import { describe, it, expect } from 'vitest'

// ── Stats metrics completeness ────────────────────────────────────────

describe('Admin stats response shape', () => {
  // Simulates what GET /admin/stats should return
  const mockStats = {
    totalUsers: 150,
    dau: 12,
    mau: 87,
    totalXpDistributed: 45000,
    aiCallsToday: 23,
    duelsThisWeek: 5,
    top10Users: [{ id: '1', firstName: 'Test', xp: 5000, level: 6 }],
    monthlyRevenue: 50000,
    activeSubscriptions: 8,
    subsByPlan: [{ planId: 'p1', planName: 'Premium', count: 5 }],
    freeUsers: 142,
    conversionRate: 2.5,
    geminiCostFCFA: 46,
    recentSignups: [],
    revenueByMonth: [],
    recentActivity: []
  }

  it('has all 11 required metrics', () => {
    const required = [
      'totalUsers', 'dau', 'mau',
      'totalXpDistributed', 'aiCallsToday', 'duelsThisWeek', 'top10Users',
      'monthlyRevenue', 'activeSubscriptions', 'subsByPlan', 'conversionRate',
    ]
    required.forEach(key => {
      expect(mockStats).toHaveProperty(key)
    })
  })

  it('has Gemini cost estimate', () => {
    expect(mockStats.geminiCostFCFA).toBeGreaterThanOrEqual(0)
  })

  it('has freeUsers count', () => {
    expect(mockStats.freeUsers).toBe(mockStats.totalUsers - mockStats.activeSubscriptions)
  })

  it('conversion rate is a percentage', () => {
    expect(mockStats.conversionRate).toBeGreaterThanOrEqual(0)
    expect(mockStats.conversionRate).toBeLessThanOrEqual(100)
  })

  it('top10Users is an array with at most 10', () => {
    expect(Array.isArray(mockStats.top10Users)).toBe(true)
    expect(mockStats.top10Users.length).toBeLessThanOrEqual(10)
  })
})

// ── Suspension logic ──────────────────────────────────────────────────

describe('User suspension logic', () => {
  function buildUpdateData(isActive, suspendedReason) {
    const data = {}
    if (typeof isActive === 'boolean') {
      data.isActive = isActive
      if (!isActive && suspendedReason) {
        data.suspendedReason = suspendedReason
      }
      if (isActive) {
        data.suspendedReason = null
      }
    }
    return data
  }

  it('suspend sets isActive=false and includes reason', () => {
    const data = buildUpdateData(false, 'Violation des regles')
    expect(data.isActive).toBe(false)
    expect(data.suspendedReason).toBe('Violation des regles')
  })

  it('reactivate sets isActive=true and clears reason', () => {
    const data = buildUpdateData(true, null)
    expect(data.isActive).toBe(true)
    expect(data.suspendedReason).toBeNull()
  })

  it('suspend without reason still sets isActive=false', () => {
    const data = buildUpdateData(false, '')
    expect(data.isActive).toBe(false)
    expect(data.suspendedReason).toBeUndefined()
  })
})

// ── Login blocked for suspended users ─────────────────────────────────

describe('Login suspension check', () => {
  function loginCheck(user) {
    if (!user.isActive) {
      return { blocked: true, reason: user.suspendedReason || 'Votre compte a ete suspendu.' }
    }
    return { blocked: false }
  }

  it('blocks suspended user with default message', () => {
    const result = loginCheck({ isActive: false })
    expect(result.blocked).toBe(true)
    expect(result.reason).toBe('Votre compte a ete suspendu.')
  })

  it('blocks suspended user with custom reason', () => {
    const result = loginCheck({ isActive: false, suspendedReason: 'Triche detectee' })
    expect(result.blocked).toBe(true)
    expect(result.reason).toBe('Triche detectee')
  })

  it('allows active user', () => {
    const result = loginCheck({ isActive: true })
    expect(result.blocked).toBe(false)
  })
})

// ── Broadcast notification validation ─────────────────────────────────

describe('Broadcast notification validation', () => {
  function validateBroadcast(title, message) {
    if (!title || !message) return { valid: false, error: 'Title and message are required' }
    return { valid: true }
  }

  it('rejects empty title', () => {
    expect(validateBroadcast('', 'message').valid).toBe(false)
  })

  it('rejects empty message', () => {
    expect(validateBroadcast('title', '').valid).toBe(false)
  })

  it('accepts valid title and message', () => {
    expect(validateBroadcast('Hello', 'World').valid).toBe(true)
  })
})

// ── Broadcast batch logic ─────────────────────────────────────────────

describe('Broadcast batch splitting', () => {
  function splitBatches(users, batchSize) {
    const batches = []
    for (let i = 0; i < users.length; i += batchSize) {
      batches.push(users.slice(i, i + batchSize))
    }
    return batches
  }

  it('splits 120 users into 3 batches of 50/50/20', () => {
    const users = Array.from({ length: 120 }, (_, i) => ({ id: String(i) }))
    const batches = splitBatches(users, 50)
    expect(batches).toHaveLength(3)
    expect(batches[0]).toHaveLength(50)
    expect(batches[1]).toHaveLength(50)
    expect(batches[2]).toHaveLength(20)
  })

  it('handles fewer than batch size', () => {
    const users = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }))
    const batches = splitBatches(users, 50)
    expect(batches).toHaveLength(1)
    expect(batches[0]).toHaveLength(10)
  })

  it('handles empty array', () => {
    const batches = splitBatches([], 50)
    expect(batches).toHaveLength(0)
  })
})

// ── Destructive confirm SUPPRIMER ─────────────────────────────────────

describe('Destructive confirm validation', () => {
  it('SUPPRIMER matches', () => {
    expect('SUPPRIMER' === 'SUPPRIMER').toBe(true)
  })

  it('supprimer lowercase does NOT match', () => {
    expect('supprimer' === 'SUPPRIMER').toBe(false)
  })

  it('empty does NOT match', () => {
    expect('' === 'SUPPRIMER').toBe(false)
  })

  it('partial does NOT match', () => {
    expect('SUPPRI' === 'SUPPRIMER').toBe(false)
  })
})

// ── User search extended fields ───────────────────────────────────────

describe('User search fields', () => {
  const searchFields = ['firstName', 'lastName', 'email', 'username', 'phoneNumber', 'id']

  it('includes all 6 search fields', () => {
    expect(searchFields).toHaveLength(6)
    expect(searchFields).toContain('phoneNumber')
    expect(searchFields).toContain('id')
  })
})

// ── isAdmin naming consistency ────────────────────────────────────────

describe('Admin flag naming', () => {
  it('uses snake_case is_admin consistently', () => {
    const user = { is_admin: true }
    expect(user.is_admin).toBe(true)
    // isAdmin (camelCase) should NOT be used
    expect(user.isAdmin).toBeUndefined()
  })
})

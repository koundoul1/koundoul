/**
 * Baseline tests for error analyzer utility.
 * Pure functions — no DOM needed.
 */
import { describe, it, expect } from 'vitest'
import { assessConfidenceLevel } from '../utils/errorAnalyzer'

describe('errorAnalyzer', () => {
  describe('assessConfidenceLevel', () => {
    it('returns a result with level property', () => {
      const result = assessConfidenceLevel('x = 2')
      expect(result).toHaveProperty('level')
      expect(['low', 'medium', 'high']).toContain(result.level)
    })

    it('returns low confidence for very short answers', () => {
      const result = assessConfidenceLevel('?')
      expect(result.level).toBe('low')
    })
  })
})

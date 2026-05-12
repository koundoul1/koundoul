/**
 * Regression tests for Parent Coach IA (Phase 9 Bloc 2).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

var backendDir = path.resolve(__dirname, '../../backend/src')

function readBackend(rel) {
  return fs.readFileSync(path.join(backendDir, rel), 'utf-8')
}

// ── System prompts ────────────────────────────────────────────────────

describe('Parent Coach system prompts', () => {
  var promptFile = readBackend('prompts/parentCoach.js')

  it('has general prompt', () => {
    expect(promptFile).toContain('PARENT_COACH_GENERAL')
    expect(promptFile).toContain('Coach IA Parent de Koundoul')
  })

  it('has contextualized template with child placeholders', () => {
    expect(promptFile).toContain('PARENT_COACH_CONTEXTUALIZED_TEMPLATE')
    expect(promptFile).toContain('{childName}')
    expect(promptFile).toContain('{childXp}')
    expect(promptFile).toContain('{quizAvgScore}')
    expect(promptFile).toContain('{flashcardsMastered}')
  })

  it('mentions privacy (no access to child conversations)', () => {
    expect(promptFile).toContain('VIE PRIVEE')
    expect(promptFile).toContain('conversations')
  })

  it('buildContextualizedPrompt replaces placeholders', () => {
    var { buildContextualizedPrompt } = require('../../backend/src/prompts/parentCoach')
    var result = buildContextualizedPrompt({
      firstName: 'Aminata',
      xp: 2500,
      level: 3,
      streak: 5,
      lastLoginAt: '2026-05-11',
      lessonsCompleted: 20,
      quizAvgScore: 72,
      duelsPlayed: 4,
      duelsWon: 2,
      flashcardsMastered: 15,
      flashcardsLearning: 8,
      flashcardsDue: 3,
      alerts: []
    })
    expect(result).toContain('Aminata')
    expect(result).toContain('2500')
    expect(result).toContain('72')
    expect(result).not.toContain('{childName}')
  })
})

// ── Routes file validation ────────────────────────────────────────────

describe('Parent Coach routes', () => {
  var routeFile = readBackend('routes/parentCoach.js')

  it('has POST /chat with SSE', () => {
    expect(routeFile).toContain("router.post('/chat'")
    expect(routeFile).toContain('text/event-stream')
    expect(routeFile).toContain('streamGenerate')
  })

  it('supports general and contextualized modes', () => {
    expect(routeFile).toContain("mode === 'contextualized'")
    expect(routeFile).toContain('PARENT_COACH_GENERAL')
    expect(routeFile).toContain('buildContextualizedPrompt')
  })

  it('verifies parent-child link in contextualized mode', () => {
    expect(routeFile).toContain('isLinked')
    expect(routeFile).toContain('Enfant non lie')
  })

  it('checks isParent before allowing access', () => {
    expect(routeFile).toContain('isParent')
    expect(routeFile).toContain('Acces reserve aux parents')
  })

  it('uses AI quota middleware', () => {
    expect(routeFile).toContain('checkAiQuota')
    expect(routeFile).toContain('incrementUsage')
  })

  it('has GET /conversations for parent history', () => {
    expect(routeFile).toContain("router.get('/conversations'")
    expect(routeFile).toContain('[Parent]')
  })

  it('has DELETE /conversations/:id', () => {
    expect(routeFile).toContain("router.delete('/conversations/:id'")
  })

  it('has no curly quotes', () => {
    expect(routeFile).not.toMatch(/[\u2018\u2019\u201C\u201D]/)
  })
})

// ── Registration in index.js ──────────────────────────────────────────

describe('Parent Coach registered in server', () => {
  var indexFile = readBackend('index.js')

  it('mounts /api/parent-coach route', () => {
    expect(indexFile).toContain("'/api/parent-coach'")
    expect(indexFile).toContain('parentCoach')
  })
})

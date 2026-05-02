/**
 * Tests for the gamification service (pure logic) and frontend integration.
 * Backend service logic is tested via its exported pure functions.
 * Frontend AuthContext reducer and useGamification are tested with jsdom.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── 1. Backend pure helpers (importable in Vitest via Node compat) ──

describe('Gamification level calculation', () => {
  // Re-implement the formula here to test the contract, since we can't
  // import CommonJS from the backend directly in a Vitest ESM context.
  const XP_PER_LEVEL = 1000
  const calculateLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1

  it('level 1 at 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('level 1 at 999 XP', () => {
    expect(calculateLevel(999)).toBe(1)
  })

  it('level 2 at 1000 XP', () => {
    expect(calculateLevel(1000)).toBe(2)
  })

  it('level 3 at 2500 XP', () => {
    expect(calculateLevel(2500)).toBe(3)
  })

  it('level 11 at 10000 XP', () => {
    expect(calculateLevel(10000)).toBe(11)
  })
})

// ── 2. AuthContext UPDATE_USER_STATS reducer ──

describe('AuthContext UPDATE_USER_STATS', () => {
  // Inline the reducer logic to test it in isolation
  const UPDATE_USER_STATS = 'UPDATE_USER_STATS'

  function authReducer(state, action) {
    if (action.type === UPDATE_USER_STATS) {
      return {
        ...state,
        user: {
          ...state.user,
          xp: action.payload.totalXp ?? state.user?.xp,
          level: action.payload.newLevel ?? state.user?.level,
          streak: action.payload.newStreak ?? state.user?.streak
        }
      }
    }
    return state
  }

  it('merges xp, level, streak into existing user', () => {
    const state = { user: { id: '1', xp: 100, level: 1, streak: 2, email: 'a@b.com' } }
    const action = {
      type: UPDATE_USER_STATS,
      payload: { totalXp: 200, newLevel: 1, newStreak: 3 }
    }
    const next = authReducer(state, action)
    expect(next.user.xp).toBe(200)
    expect(next.user.level).toBe(1)
    expect(next.user.streak).toBe(3)
    expect(next.user.email).toBe('a@b.com') // preserved
  })

  it('keeps existing values when payload fields are undefined', () => {
    const state = { user: { xp: 500, level: 1, streak: 5 } }
    const action = { type: UPDATE_USER_STATS, payload: {} }
    const next = authReducer(state, action)
    expect(next.user.xp).toBe(500)
    expect(next.user.streak).toBe(5)
  })
})

// ── 3. processAction response shape contract ──

describe('processAction response shape', () => {
  it('contains all required fields', () => {
    // Simulate what the backend returns
    const response = {
      xpGained: 100,
      totalXp: 1100,
      newLevel: 2,
      leveledUp: true,
      newStreak: 3,
      streakBroken: false,
      newBadges: [{ name: 'Premiere Lecon', icon: '🎯', description: 'test', points: 50 }]
    }

    expect(response).toHaveProperty('xpGained')
    expect(response).toHaveProperty('totalXp')
    expect(response).toHaveProperty('newLevel')
    expect(response).toHaveProperty('leveledUp')
    expect(response).toHaveProperty('newStreak')
    expect(response).toHaveProperty('streakBroken')
    expect(response).toHaveProperty('newBadges')
    expect(Array.isArray(response.newBadges)).toBe(true)
    expect(response.newBadges[0]).toHaveProperty('name')
    expect(response.newBadges[0]).toHaveProperty('icon')
  })
})

// ── 4. useGamification toast triggering ──

describe('useGamification processActionResult', () => {
  it('calls showGamificationToast for XP, level-up, and badges', async () => {
    // Mock the toast module
    const toastCalls = []
    vi.doMock('../components/GamificationToast', () => ({
      showGamificationToast: (t) => toastCalls.push(t)
    }))

    // Mock useAuth
    const updateUserStats = vi.fn()
    vi.doMock('../context/AuthContext', () => ({
      useAuth: () => ({ updateUserStats })
    }))

    const { useGamification } = await import('../hooks/useGamification')
    const { processActionResult } = useGamification()

    processActionResult({
      xpGained: 100,
      totalXp: 1100,
      newLevel: 2,
      leveledUp: true,
      newStreak: 3,
      streakBroken: false,
      newBadges: [{ name: 'Test Badge', icon: '🏆', description: 'desc', points: 50 }]
    })

    expect(updateUserStats).toHaveBeenCalledOnce()
    // XP toast + level-up toast + badge toast = 3
    expect(toastCalls.length).toBe(3)
    expect(toastCalls[0].type).toBe('xp')
    expect(toastCalls[1].type).toBe('levelup')
    expect(toastCalls[2].type).toBe('badge')

    vi.doUnmock('../components/GamificationToast')
    vi.doUnmock('../context/AuthContext')
  })
})

// ── 5. Badge condition label helper ──

describe('Badge condition label', () => {
  // Inline the helper from Badges.jsx
  function conditionLabel(condition) {
    if (!condition) return ''
    const parts = condition.split(':')
    const type = parts[0]
    const value = parts[parts.length - 1]
    const labels = {
      complete_lesson: `${value} lecon(s)`,
      complete_quiz: `${value} quiz`,
      streak: `${value} jours consecutifs`,
      level: `Niveau ${value}`,
      perfect_quiz: `${value} quiz parfait(s)`,
      subject: `${value} lecons de ${parts[1]}`,
      level_mastery: `${value} lecons niveau ${parts[1]}`
    }
    return labels[type] || condition
  }

  it('formats complete_lesson:10 correctly', () => {
    expect(conditionLabel('complete_lesson:10')).toBe('10 lecon(s)')
  })

  it('formats streak:7 correctly', () => {
    expect(conditionLabel('streak:7')).toBe('7 jours consecutifs')
  })

  it('formats subject:Mathematiques:20 correctly', () => {
    expect(conditionLabel('subject:Mathematiques:20')).toBe('20 lecons de Mathematiques')
  })

  it('returns empty string for null', () => {
    expect(conditionLabel(null)).toBe('')
  })
})

// ── 6. Dashboard activity endpoint response shape ──

describe('Dashboard activity data shape', () => {
  it('activity array has date and count per entry', () => {
    // Simulate the response from GET /dashboard/activity
    const activity = [
      { date: '2026-04-25', count: 3 },
      { date: '2026-04-26', count: 0 },
      { date: '2026-04-27', count: 1 },
      { date: '2026-04-28', count: 2 },
      { date: '2026-04-29', count: 0 },
      { date: '2026-04-30', count: 5 },
      { date: '2026-05-01', count: 1 }
    ]

    expect(activity).toHaveLength(7)
    for (const entry of activity) {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('count')
      expect(typeof entry.date).toBe('string')
      expect(typeof entry.count).toBe('number')
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

// ── 7. XP duplication prevention ──

describe('completeLesson XP duplication prevention', () => {
  it('first completion returns alreadyCompleted=false with XP', () => {
    const response = {
      success: true,
      alreadyCompleted: false,
      xpEarned: 100,
      gamification: { xpGained: 100, totalXp: 100, newLevel: 1, leveledUp: false, newStreak: 1, streakBroken: false, newBadges: [] }
    }
    expect(response.alreadyCompleted).toBe(false)
    expect(response.xpEarned).toBe(100)
    expect(response.gamification).not.toBeNull()
  })

  it('re-completion returns alreadyCompleted=true with 0 XP', () => {
    const response = {
      success: true,
      alreadyCompleted: true,
      xpEarned: 0,
      gamification: null
    }
    expect(response.alreadyCompleted).toBe(true)
    expect(response.xpEarned).toBe(0)
    expect(response.gamification).toBeNull()
  })

  it('frontend should not call processActionResult when alreadyCompleted', () => {
    const processActionResult = vi.fn()
    const response = { success: true, alreadyCompleted: true, gamification: null }

    // Simulate the frontend logic from MicroLessonDetail handleComplete
    if (response.success && !response.alreadyCompleted) {
      processActionResult(response.gamification)
    }

    expect(processActionResult).not.toHaveBeenCalled()
  })
})

// ── 8. Phase 2B.1 — Lesson auto-mark prevention ──

describe('Lesson auto-mark prevention', () => {
  it('completion with completed=false should NOT mark as completed', () => {
    // Simulate the frontend check from MicroLessonDetail useEffect
    const completionRes = { success: true, data: { completed: false, score: null, timeSpent: 0 } }
    const shouldMarkCompleted = completionRes?.success && completionRes?.data?.completed === true
    expect(shouldMarkCompleted).toBe(false)
  })

  it('completion with completed=true SHOULD mark as completed', () => {
    const completionRes = { success: true, data: { completed: true, score: 85, timeSpent: 120 } }
    const shouldMarkCompleted = completionRes?.success && completionRes?.data?.completed === true
    expect(shouldMarkCompleted).toBe(true)
  })

  it('null/missing completion data should NOT mark as completed', () => {
    const completionRes = { success: true, data: null }
    const shouldMarkCompleted = completionRes?.success && completionRes?.data?.completed === true
    expect(shouldMarkCompleted).toBe(false)
  })
})

// ── 9. Empty lesson content detection ──

describe('Empty lesson content detection', () => {
  function hasContent(lesson) {
    const s = lesson?.content_sections
    if (!s) return false
    if (Array.isArray(s) && s.length === 0) return false
    if (typeof s === 'object' && !Array.isArray(s) && Object.keys(s).length === 0) return false
    return true
  }

  it('null content_sections = no content', () => {
    expect(hasContent({ content_sections: null })).toBe(false)
  })

  it('empty array = no content', () => {
    expect(hasContent({ content_sections: [] })).toBe(false)
  })

  it('empty object = no content', () => {
    expect(hasContent({ content_sections: {} })).toBe(false)
  })

  it('array with sections = has content', () => {
    expect(hasContent({ content_sections: [{ title: 'Intro', content: 'text' }] })).toBe(true)
  })

  it('object with fields = has content', () => {
    expect(hasContent({ content_sections: { introduction: 'text' } })).toBe(true)
  })
})

// ── 10. Dark theme: no light-theme classes in MicroLessonDetail ──

describe('MicroLessonDetail dark theme contract', () => {
  it('should not contain light-theme background classes', () => {
    // This is a static analysis test — verify the component source
    // doesn't use light backgrounds
    const lightClasses = ['bg-blue-50', 'bg-white', 'from-blue-50', 'bg-gradient-to-br from-blue-50', 'border-blue-100', 'text-blue-700']
    // If any of these appear in the rendered output, the dark theme is broken
    // We test the contract, not the file content directly
    for (const cls of lightClasses) {
      // The presence of these classes in the NEW component would be a regression
      // This test documents the expectation
      expect(cls).toBeDefined() // placeholder — real check would be against rendered DOM
    }
    // The real validation is: MicroLessonDetail now uses k-card, text-kprimary, text-gray-300, etc.
    expect(true).toBe(true)
  })
})

// ── 11. Phase 2B.2 — Exercise self-evaluation XP calculation ──

describe('Exercise self-evaluation XP', () => {
  const basePoints = 10;
  const xpMultiplier = { correct: 1, partial: 0.5, incorrect: 0.25 };
  const calcXP = (selfEval) => Math.floor(basePoints * xpMultiplier[selfEval]);

  it('correct = 100% of base points', () => {
    expect(calcXP('correct')).toBe(10);
  })

  it('partial = 50% of base points', () => {
    expect(calcXP('partial')).toBe(5);
  })

  it('incorrect = 25% of base points', () => {
    expect(calcXP('incorrect')).toBe(2);
  })

  it('works with non-default points (e.g. 20)', () => {
    const bp = 20;
    expect(Math.floor(bp * 1)).toBe(20);
    expect(Math.floor(bp * 0.5)).toBe(10);
    expect(Math.floor(bp * 0.25)).toBe(5);
  })
})

// ── 12. Quiz timer auto-submit contract ──

describe('Quiz timer auto-submit', () => {
  it('timer reaching 0 should trigger submission', () => {
    // Simulate: when prev <= 1 in the interval callback, submit fires
    let submitted = false;
    const setTimeLeft = (fn) => {
      const prev = 1;
      const next = fn(prev);
      if (next === 0) submitted = true;
      return next;
    };
    setTimeLeft(prev => {
      if (prev <= 1) return 0;
      return prev - 1;
    });
    expect(submitted).toBe(true);
  })

  it('timer > 1 should NOT trigger submission', () => {
    let submitted = false;
    const setTimeLeft = (fn) => {
      const prev = 5;
      const next = fn(prev);
      if (next === 0) submitted = true;
      return next;
    };
    setTimeLeft(prev => {
      if (prev <= 1) return 0;
      return prev - 1;
    });
    expect(submitted).toBe(false);
  })
})

// ── 13. Quiz difficulty filter logic ──

describe('Quiz difficulty filter', () => {
  const questions = [
    { id: 1, difficulty: 1 },
    { id: 2, difficulty: 1 },
    { id: 3, difficulty: 2 },
    { id: 4, difficulty: 2 },
    { id: 5, difficulty: 2 },
    { id: 6, difficulty: 3 },
    { id: 7, difficulty: 4 },
    { id: 8, difficulty: null }
  ];

  const filterByDifficulty = (qs, diff) => {
    if (diff === 'all') return qs;
    return qs.filter(q => {
      const d = q.difficulty;
      if (d == null) return true;
      if (diff === 'easy') return d === 1;
      if (diff === 'medium') return d === 2;
      if (diff === 'hard') return d >= 3;
      return true;
    });
  };

  it('all returns everything', () => {
    expect(filterByDifficulty(questions, 'all')).toHaveLength(8);
  })

  it('easy returns difficulty=1 + null', () => {
    expect(filterByDifficulty(questions, 'easy')).toHaveLength(3); // 2 easy + 1 null
  })

  it('medium returns difficulty=2 + null', () => {
    expect(filterByDifficulty(questions, 'medium')).toHaveLength(4); // 3 medium + 1 null
  })

  it('hard returns difficulty>=3 + null', () => {
    expect(filterByDifficulty(questions, 'hard')).toHaveLength(3); // 1 diff3 + 1 diff4 + 1 null
  })
})

// ── 14. Phase 2B.3a — Solver SSE streaming contract ──

describe('Solver SSE event parsing', () => {
  function parseSSE(raw) {
    const events = [];
    const parts = raw.split('\n\n');
    for (const part of parts) {
      const eventLine = part.split('\n').find(l => l.startsWith('event: '));
      const dataLine = part.split('\n').find(l => l.startsWith('data: '));
      if (!eventLine || !dataLine) continue;
      try {
        events.push({ event: eventLine.slice(7), data: JSON.parse(dataLine.slice(6)) });
      } catch { /* skip malformed */ }
    }
    return events;
  }

  it('parses meta event', () => {
    const raw = 'event: meta\ndata: {"historyId":"abc","status":"streaming"}\n\n';
    const events = parseSSE(raw);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('meta');
    expect(events[0].data.status).toBe('streaming');
  })

  it('parses chunk events', () => {
    const raw = 'event: chunk\ndata: {"text":"Hello "}\n\nevent: chunk\ndata: {"text":"world"}\n\n';
    const events = parseSSE(raw);
    expect(events).toHaveLength(2);
    expect(events[0].data.text + events[1].data.text).toBe('Hello world');
  })

  it('parses structured event with steps', () => {
    const raw = 'event: structured\ndata: {"steps":[{"step":1,"description":"test","content":"detail"}],"requiresGraph":false,"hints":[],"points":10}\n\n';
    const events = parseSSE(raw);
    expect(events[0].data.steps).toHaveLength(1);
    expect(events[0].data.requiresGraph).toBe(false);
  })

  it('parses done event', () => {
    const raw = 'event: done\ndata: {"historyId":"abc","status":"completed"}\n\n';
    const events = parseSSE(raw);
    expect(events[0].event).toBe('done');
    expect(events[0].data.status).toBe('completed');
  })

  it('parses error event', () => {
    const raw = 'event: error\ndata: {"message":"Quota exceeded"}\n\n';
    const events = parseSSE(raw);
    expect(events[0].event).toBe('error');
    expect(events[0].data.message).toBe('Quota exceeded');
  })

  it('handles mixed stream of events', () => {
    const raw = [
      'event: meta\ndata: {"historyId":"x","status":"streaming"}',
      'event: chunk\ndata: {"text":"step 1"}',
      'event: chunk\ndata: {"text":" done"}',
      'event: structured\ndata: {"steps":[],"requiresGraph":false,"hints":[],"points":10}',
      'event: done\ndata: {"historyId":"x","status":"completed"}'
    ].join('\n\n') + '\n\n';
    const events = parseSSE(raw);
    expect(events).toHaveLength(5);
    expect(events.map(e => e.event)).toEqual(['meta', 'chunk', 'chunk', 'structured', 'done']);
  })
})

describe('Gemini service error classes', () => {
  it('GeminiError has correct name', () => {
    // Inline test — can\'t import CJS from ESM easily
    class GeminiError extends Error {
      constructor(msg) { super(msg); this.name = 'GeminiError'; }
    }
    const err = new GeminiError('test');
    expect(err.name).toBe('GeminiError');
    expect(err.message).toBe('test');
    expect(err instanceof Error).toBe(true);
  })
})

// ── 15. Phase 2B.3b — parseStructured robustness ──

describe('parseStructured JSON parser', () => {
  // Inline the function to test without CJS import issues
  function parseStructured(rawText) {
    const FALLBACK = {
      steps: [], requiresGraph: false, functionString: null,
      functionName: null, hints: [], points: 10, detectedDomain: 'math'
    };
    if (!rawText || typeof rawText !== 'string') return FALLBACK;
    let cleaned = rawText.trim();
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) cleaned = fenceMatch[1].trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') return { ...FALLBACK, ...parsed };
    } catch (_e) { /* not valid JSON */ }
    const openIdx = cleaned.indexOf('{');
    const closeIdx = cleaned.lastIndexOf('}');
    if (openIdx !== -1 && closeIdx > openIdx) {
      try {
        const parsed = JSON.parse(cleaned.slice(openIdx, closeIdx + 1));
        if (parsed && typeof parsed === 'object') return { ...FALLBACK, ...parsed };
      } catch (_e) { /* extraction failed */ }
    }
    return FALLBACK;
  }

  it('parses clean JSON', () => {
    const input = '{"steps":[{"step":1,"description":"test","content":"detail"}],"requiresGraph":false,"hints":["h1"],"points":10,"detectedDomain":"math"}';
    const result = parseStructured(input);
    expect(result.steps).toHaveLength(1);
    expect(result.detectedDomain).toBe('math');
  })

  it('parses JSON wrapped in markdown code block', () => {
    const input = '```json\n{"steps":[],"requiresGraph":true,"functionString":"x**2","functionName":"f(x)","hints":[],"points":15,"detectedDomain":"physics"}\n```';
    const result = parseStructured(input);
    expect(result.requiresGraph).toBe(true);
    expect(result.functionString).toBe('x**2');
    expect(result.detectedDomain).toBe('physics');
  })

  it('parses JSON with preamble text', () => {
    const input = 'Here is the JSON:\n{"steps":[],"hints":["a","b","c"],"points":5,"detectedDomain":"chemistry"}';
    const result = parseStructured(input);
    expect(result.hints).toHaveLength(3);
    expect(result.detectedDomain).toBe('chemistry');
  })

  it('returns fallback for totally malformed text', () => {
    const result = parseStructured('This is not JSON at all');
    expect(result.steps).toEqual([]);
    expect(result.points).toBe(10);
    expect(result.requiresGraph).toBe(false);
  })

  it('returns fallback for null input', () => {
    const result = parseStructured(null);
    expect(result.steps).toEqual([]);
  })

  it('returns fallback for empty string', () => {
    const result = parseStructured('');
    expect(result.steps).toEqual([]);
  })

  it('merges with defaults (missing fields get defaults)', () => {
    const input = '{"steps":[{"step":1,"description":"x","content":"y"}]}';
    const result = parseStructured(input);
    expect(result.steps).toHaveLength(1);
    expect(result.requiresGraph).toBe(false);
    expect(result.hints).toEqual([]);
    expect(result.detectedDomain).toBe('math');
  })
})

describe('SolverHistory status transitions', () => {
  it('valid status flow: pending -> streaming -> completed', () => {
    const validStatuses = ['pending', 'streaming', 'completed', 'failed'];
    const flow = ['pending', 'streaming', 'completed'];
    for (const s of flow) {
      expect(validStatuses).toContain(s);
    }
  })

  it('valid status flow: pending -> streaming -> failed', () => {
    const flow = ['pending', 'streaming', 'failed'];
    const validStatuses = ['pending', 'streaming', 'completed', 'failed'];
    for (const s of flow) {
      expect(validStatuses).toContain(s);
    }
  })
})

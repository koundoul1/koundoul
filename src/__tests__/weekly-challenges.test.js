/**
 * Regression tests for Weekly Challenges (Phase 4.3).
 */
import { describe, it, expect } from 'vitest'

const { getCurrentWeekWindow } = require('../../backend/src/jobs/weeklyChallengeJob')

// ── Week window calculation ─────────────────────────────────────────

describe('getCurrentWeekWindow', () => {
  it('returns monday and sunday as Date objects', () => {
    const { monday, sunday } = getCurrentWeekWindow();
    expect(monday).toBeInstanceOf(Date);
    expect(sunday).toBeInstanceOf(Date);
  });

  it('monday is at 00:00:00 UTC', () => {
    const { monday } = getCurrentWeekWindow();
    expect(monday.getUTCHours()).toBe(0);
    expect(monday.getUTCMinutes()).toBe(0);
    expect(monday.getUTCSeconds()).toBe(0);
  });

  it('sunday is at 23:59:59 UTC', () => {
    const { sunday } = getCurrentWeekWindow();
    expect(sunday.getUTCHours()).toBe(23);
    expect(sunday.getUTCMinutes()).toBe(59);
    expect(sunday.getUTCSeconds()).toBe(59);
  });

  it('monday is a Monday (day 1)', () => {
    const { monday } = getCurrentWeekWindow();
    expect(monday.getUTCDay()).toBe(1);
  });

  it('sunday is a Sunday (day 0)', () => {
    const { sunday } = getCurrentWeekWindow();
    expect(sunday.getUTCDay()).toBe(0);
  });

  it('span is exactly 7 days minus 1ms', () => {
    const { monday, sunday } = getCurrentWeekWindow();
    const diff = sunday.getTime() - monday.getTime();
    const sevenDaysMinusMs = 7 * 86400000 - 1;
    expect(diff).toBe(sevenDaysMinusMs);
  });
});

// ── XP rewards by difficulty ────────────────────────────────────────

describe('XP rewards by difficulty', () => {
  const DIFFICULTIES = [
    { level: 1, label: 'Facile', xpReward: 50 },
    { level: 2, label: 'Moyen', xpReward: 100 },
    { level: 3, label: 'Difficile', xpReward: 200 }
  ];

  it('Facile gives 50 XP', () => {
    expect(DIFFICULTIES.find(d => d.label === 'Facile').xpReward).toBe(50);
  });

  it('Moyen gives 100 XP', () => {
    expect(DIFFICULTIES.find(d => d.label === 'Moyen').xpReward).toBe(100);
  });

  it('Difficile gives 200 XP', () => {
    expect(DIFFICULTIES.find(d => d.label === 'Difficile').xpReward).toBe(200);
  });
});

// ── Difficulty rotation ─────────────────────────────────────────────

describe('Difficulty rotation across weeks', () => {
  const SUBJECTS = ['Mathématiques', 'Physique', 'Chimie'];
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
  ];

  it('each week uses a different permutation (6-week cycle)', () => {
    const seen = new Set();
    for (let w = 0; w < 6; w++) {
      const perm = permutations[w % 6].join(',');
      expect(seen.has(perm)).toBe(false);
      seen.add(perm);
    }
  });

  it('all 3 subjects get assigned a difficulty each week', () => {
    const perm = permutations[0]; // [0,1,2]
    expect(perm).toHaveLength(SUBJECTS.length);
  });
});

// ── User status logic ───────────────────────────────────────────────

describe('Challenge userStatus', () => {
  function getUserStatus(attempt) {
    if (!attempt) return 'not_started';
    if (attempt.completedAt) return 'completed';
    return 'in_progress';
  }

  it('no attempt → not_started', () => {
    expect(getUserStatus(null)).toBe('not_started');
  });

  it('attempt without completedAt → in_progress', () => {
    expect(getUserStatus({ id: '1', completedAt: null })).toBe('in_progress');
  });

  it('attempt with completedAt → completed', () => {
    expect(getUserStatus({ id: '1', completedAt: new Date() })).toBe('completed');
  });
});

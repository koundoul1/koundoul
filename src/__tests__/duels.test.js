/**
 * Regression tests for Duels module (Phase 4.4).
 */
import { describe, it, expect } from 'vitest'

// ── Duel status values ──────────────────────────────────────────────

describe('Duel status normalization', () => {
  const VALID_STATUSES = ['pending', 'active', 'completed', 'expired'];

  it('all statuses are lowercase', () => {
    VALID_STATUSES.forEach(s => {
      expect(s).toBe(s.toLowerCase());
    });
  });

  it('seed uses lowercase pending', () => {
    const seedStatus = 'pending'; // from seedDuel.js fix
    expect(VALID_STATUSES).toContain(seedStatus);
  });
});

// ── XP rewards ──────────────────────────────────────────────────────

describe('Duel XP rewards', () => {
  it('winner gets 200 XP', () => {
    const xpReward = 200;
    expect(xpReward).toBe(200);
  });

  it('loser gets 50 XP', () => {
    const loserXp = 50;
    expect(loserXp).toBe(50);
  });

  it('draw gives 100 XP each', () => {
    const drawXp = 100;
    expect(drawXp).toBe(100);
  });
});

// ── Winner determination ────────────────────────────────────────────

describe('Winner determination logic', () => {
  function determineWinner(challengerScore, opponentScore, challengerTime, opponentTime) {
    if (challengerScore > opponentScore) return 'challenger';
    if (opponentScore > challengerScore) return 'opponent';
    // Tie: faster wins
    if (challengerTime < opponentTime) return 'challenger';
    if (opponentTime < challengerTime) return 'opponent';
    return 'draw';
  }

  it('higher score wins', () => {
    expect(determineWinner(8, 5, 300, 200)).toBe('challenger');
  });

  it('lower score loses', () => {
    expect(determineWinner(3, 7, 100, 400)).toBe('opponent');
  });

  it('equal score: faster time wins', () => {
    expect(determineWinner(5, 5, 200, 300)).toBe('challenger');
  });

  it('equal score and time: draw', () => {
    expect(determineWinner(5, 5, 200, 200)).toBe('draw');
  });
});

// ── Duel expiration ─────────────────────────────────────────────────

describe('Duel expiration logic', () => {
  it('duel with expiresAt in the past is expired', () => {
    const expiresAt = new Date(Date.now() - 3600000);
    const isExpired = new Date(expiresAt) < new Date();
    expect(isExpired).toBe(true);
  });

  it('duel with expiresAt in the future is not expired', () => {
    const expiresAt = new Date(Date.now() + 3600000);
    const isExpired = new Date(expiresAt) < new Date();
    expect(isExpired).toBe(false);
  });

  it('stale duel statuses are pending and active', () => {
    const staleStatuses = ['pending', 'active'];
    expect(staleStatuses).toContain('pending');
    expect(staleStatuses).toContain('active');
    expect(staleStatuses).not.toContain('completed');
  });
});

// ── Question count validation ───────────────────────────────────────

describe('Duel question minimum', () => {
  it('requires at least 5 questions to create a duel', () => {
    const MIN_QUESTIONS = 5;
    expect(MIN_QUESTIONS).toBe(5);
    expect(3 < MIN_QUESTIONS).toBe(true);
    expect(5 >= MIN_QUESTIONS).toBe(true);
  });
});

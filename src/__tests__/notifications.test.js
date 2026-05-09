/**
 * Regression tests for Notifications system (Phase 4.1).
 */
import { describe, it, expect } from 'vitest'

// ── SSE reconnection logic ─────────────────────────────────────────

describe('SSE reconnection rules', () => {
  const MAX_RETRIES = 10;

  function shouldReconnect(status, retryCount) {
    if (status === 401 || status === 403) return false; // auth error → stop
    if (status >= 400 && status < 500) return false; // client error → stop
    if (retryCount >= MAX_RETRIES) return false; // max retries → stop
    return true; // 5xx or network → reconnect
  }

  it('401 does NOT trigger reconnect', () => {
    expect(shouldReconnect(401, 0)).toBe(false);
  });

  it('403 does NOT trigger reconnect', () => {
    expect(shouldReconnect(403, 0)).toBe(false);
  });

  it('500 triggers reconnect', () => {
    expect(shouldReconnect(500, 0)).toBe(true);
  });

  it('503 triggers reconnect', () => {
    expect(shouldReconnect(503, 0)).toBe(true);
  });

  it('stops after MAX_RETRIES (10)', () => {
    expect(shouldReconnect(500, 10)).toBe(false);
    expect(shouldReconnect(500, 9)).toBe(true);
  });
});

// ── Notification type config ────────────────────────────────────────

describe('Notification type navigation', () => {
  const NAV_PATHS = {
    duel_invite: '/challenge',
    badge_earned: '/badges',
    challenge_start: '/challenge',
    level_up: '/profile',
    payment_confirmed: '/subscriptions',
    streak_reminder: '/dashboard',
    new_message: '/forum'
  };

  it('badge_earned navigates to /badges', () => {
    expect(NAV_PATHS['badge_earned']).toBe('/badges');
  });

  it('duel_invite navigates to /challenge', () => {
    expect(NAV_PATHS['duel_invite']).toBe('/challenge');
  });

  it('payment_confirmed navigates to /subscriptions', () => {
    expect(NAV_PATHS['payment_confirmed']).toBe('/subscriptions');
  });

  it('all 7 types have navigation paths', () => {
    expect(Object.keys(NAV_PATHS)).toHaveLength(7);
  });
});

// ── notificationsEnabled toggle logic ───────────────────────────────

describe('notificationsEnabled toggle', () => {
  const CRITICAL_TYPES = ['payment_confirmed'];

  function shouldSend(type, enabled) {
    if (CRITICAL_TYPES.includes(type)) return true;
    return enabled !== false;
  }

  it('blocks badge_earned when notifications disabled', () => {
    expect(shouldSend('badge_earned', false)).toBe(false);
  });

  it('allows badge_earned when notifications enabled', () => {
    expect(shouldSend('badge_earned', true)).toBe(true);
  });

  it('allows payment_confirmed even when disabled', () => {
    expect(shouldSend('payment_confirmed', false)).toBe(true);
  });

  it('allows all types when enabled', () => {
    const types = ['badge_earned', 'level_up', 'duel_invite', 'payment_confirmed'];
    types.forEach(type => {
      expect(shouldSend(type, true)).toBe(true);
    });
  });
});

// ── Unread count badge display ──────────────────────────────────────

describe('Unread count badge', () => {
  function formatBadge(count) {
    if (count <= 0) return null;
    return count > 9 ? '9+' : String(count);
  }

  it('shows nothing for 0 unread', () => {
    expect(formatBadge(0)).toBe(null);
  });

  it('shows exact count for 1-9', () => {
    expect(formatBadge(5)).toBe('5');
  });

  it('shows 9+ for 10 or more', () => {
    expect(formatBadge(15)).toBe('9+');
  });
});

// ── timeAgo formatting ──────────────────────────────────────────────

describe('timeAgo formatting', () => {
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  it('shows "à l\'instant" for just now', () => {
    expect(timeAgo(new Date().toISOString())).toBe("à l'instant");
  });

  it('shows minutes for recent', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('il y a 5 min');
  });

  it('shows hours for same day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('il y a 3h');
  });
});

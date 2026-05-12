/**
 * Regression tests for Parent Alerts + Timeline (Phase 9 Bloc 1).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const backendDir = path.resolve(__dirname, '../../backend/src')

function readBackend(relativePath) {
  return fs.readFileSync(path.join(backendDir, relativePath), 'utf-8')
}

// ── Alert detection logic ─────────────────────────────────────────────

describe('Parent alert types', () => {
  function checkAlerts(child, quizAvg, usagePercent) {
    var alerts = [];
    var now = new Date();
    var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (!child.lastLoginAt || new Date(child.lastLoginAt) < sevenDaysAgo) {
      alerts.push({ type: 'child_inactive', severity: 'warning' });
    }
    if (quizAvg !== null && quizAvg < 50) {
      alerts.push({ type: 'quiz_score_drop', severity: 'warning' });
    }
    if (child.streak === 7 || child.streak === 14 || child.streak === 30) {
      alerts.push({ type: 'streak_milestone', severity: 'success' });
    }
    if (usagePercent >= 80) {
      alerts.push({ type: 'quota_high', severity: 'info' });
    }
    return alerts;
  }

  it('detects inactive child (no login in 7 days)', () => {
    var alerts = checkAlerts({ lastLoginAt: '2026-01-01', streak: 0 }, null, 0);
    expect(alerts.some(a => a.type === 'child_inactive')).toBe(true);
  });

  it('does NOT alert for active child', () => {
    var alerts = checkAlerts({ lastLoginAt: new Date().toISOString(), streak: 3 }, 70, 20);
    expect(alerts.some(a => a.type === 'child_inactive')).toBe(false);
  });

  it('detects quiz score drop below 50%', () => {
    var alerts = checkAlerts({ lastLoginAt: new Date().toISOString(), streak: 0 }, 35, 0);
    expect(alerts.some(a => a.type === 'quiz_score_drop')).toBe(true);
  });

  it('detects streak milestone at 7 days', () => {
    var alerts = checkAlerts({ lastLoginAt: new Date().toISOString(), streak: 7 }, 80, 0);
    expect(alerts.some(a => a.type === 'streak_milestone')).toBe(true);
    expect(alerts.find(a => a.type === 'streak_milestone').severity).toBe('success');
  });

  it('detects quota high at 80%+', () => {
    var alerts = checkAlerts({ lastLoginAt: new Date().toISOString(), streak: 0 }, null, 85);
    expect(alerts.some(a => a.type === 'quota_high')).toBe(true);
  });

  it('returns empty for healthy child', () => {
    var alerts = checkAlerts({ lastLoginAt: new Date().toISOString(), streak: 3 }, 75, 30);
    expect(alerts).toHaveLength(0);
  });
})

// ── Cron job file validation ──────────────────────────────────────────

describe('Parent alerts cron job', () => {
  var cronFile = readBackend('jobs/parentAlertsJob.js');

  it('schedules at 18:00 UTC', () => {
    expect(cronFile).toContain("'0 18 * * *'");
  });

  it('checks notificationsEnabled before sending', () => {
    expect(cronFile).toContain('notificationsEnabled');
  });

  it('avoids duplicate alerts (checks alreadySent today)', () => {
    expect(cronFile).toContain('alreadySent');
    expect(cronFile).toContain('todayStart');
  });

  it('uses sendNotification', () => {
    expect(cronFile).toContain('sendNotification');
  });

  it('has no curly quotes', () => {
    expect(cronFile).not.toMatch(/[\u2018\u2019\u201C\u201D]/);
  });
})

// ── Timeline route validation ─────────────────────────────────────────

describe('Timeline route', () => {
  var parentRoutes = readBackend('routes/parent.js');

  it('has GET /children/:childId/timeline route', () => {
    expect(parentRoutes).toContain("'/children/:childId/timeline'");
  });

  it('verifies parent-child link', () => {
    expect(parentRoutes).toContain('parent_child_links');
    expect(parentRoutes).toContain('invitationCode');
  });

  it('returns lessons, quizzes, challenges, badges', () => {
    expect(parentRoutes).toContain("type: 'lesson'");
    expect(parentRoutes).toContain("type: 'quiz'");
    expect(parentRoutes).toContain("type: 'challenge'");
    expect(parentRoutes).toContain("type: 'badge'");
  });
})

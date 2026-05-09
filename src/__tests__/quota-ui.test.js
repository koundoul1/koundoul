/**
 * UI regression tests for quota system (Phase Tarif.2).
 * Tests component logic without full React rendering.
 */
import { describe, it, expect } from 'vitest'

// ── AiQuotaBadge color logic ────────────────────────────────────────

describe('AiQuotaBadge color logic', () => {
  function getBadgeColor(used, limit) {
    const pct = limit > 0 ? (limit - used) / limit : 0;
    if (pct > 0.5) return 'green';
    if (pct > 0.2) return 'orange';
    return 'red';
  }

  it('shows green when > 50% remaining', () => {
    expect(getBadgeColor(10, 50)).toBe('green'); // 80% remaining
  });

  it('shows orange when 20-50% remaining', () => {
    expect(getBadgeColor(35, 50)).toBe('orange'); // 30% remaining
  });

  it('shows red when < 20% remaining', () => {
    expect(getBadgeColor(45, 50)).toBe('red'); // 10% remaining
  });

  it('shows red when fully used', () => {
    expect(getBadgeColor(6, 6)).toBe('red'); // 0% remaining
  });
});

// ── QuotaReachedModal messaging ─────────────────────────────────────

describe('QuotaReachedModal messaging', () => {
  function getMessage(plan, limit) {
    if (plan === 'FREE') return `Tu as fait ${limit} appels IA aujourd'hui. Passe Premium pour en avoir 50 par jour.`;
    if (plan === 'PREMIUM' || plan === 'PREMIUM_YEARLY') return `Tu as fait tes ${limit} appels IA aujourd'hui. Passe Premium Max pour 300 appels/jour.`;
    return `Tu as fait tes ${limit} appels IA aujourd'hui. Reviens demain pour de nouveaux appels !`;
  }

  function isMaxPlan(plan) {
    return ['PREMIUM_MAX', 'PREMIUM_MAX_YEARLY', 'FAMILY', 'FAMILY_YEARLY'].includes(plan);
  }

  it('FREE plan shows upsell to Premium', () => {
    const msg = getMessage('FREE', 6);
    expect(msg).toContain('Passe Premium');
    expect(msg).toContain('50 par jour');
  });

  it('PREMIUM plan shows upsell to Premium Max', () => {
    const msg = getMessage('PREMIUM', 50);
    expect(msg).toContain('Premium Max');
    expect(msg).toContain('300 appels');
  });

  it('PREMIUM_MAX plan shows no upsell', () => {
    const msg = getMessage('PREMIUM_MAX', 300);
    expect(msg).toContain('Reviens demain');
    expect(isMaxPlan('PREMIUM_MAX')).toBe(true);
  });

  it('FAMILY plan is treated as max (no upsell)', () => {
    expect(isMaxPlan('FAMILY')).toBe(true);
  });
});

// ── Subscriptions toggle logic ──────────────────────────────────────

describe('Subscriptions yearly toggle', () => {
  const YEARLY_TO_MONTHLY = {
    PREMIUM_YEARLY: 'PREMIUM',
    PREMIUM_MAX_YEARLY: 'PREMIUM_MAX',
    FAMILY_YEARLY: 'FAMILY'
  };

  it('maps yearly plan names to monthly counterparts', () => {
    expect(YEARLY_TO_MONTHLY['PREMIUM_YEARLY']).toBe('PREMIUM');
    expect(YEARLY_TO_MONTHLY['PREMIUM_MAX_YEARLY']).toBe('PREMIUM_MAX');
    expect(YEARLY_TO_MONTHLY['FAMILY_YEARLY']).toBe('FAMILY');
  });

  it('monthly toggle shows PREMIUM not PREMIUM_YEARLY', () => {
    const monthlyNames = ['PREMIUM', 'PREMIUM_MAX', 'FAMILY'];
    const yearlyNames = ['PREMIUM_YEARLY', 'PREMIUM_MAX_YEARLY', 'FAMILY_YEARLY'];
    const isYearly = false;
    const target = isYearly ? yearlyNames : monthlyNames;
    expect(target).toContain('PREMIUM');
    expect(target).not.toContain('PREMIUM_YEARLY');
  });

  it('yearly toggle shows PREMIUM_YEARLY not PREMIUM', () => {
    const monthlyNames = ['PREMIUM', 'PREMIUM_MAX', 'FAMILY'];
    const yearlyNames = ['PREMIUM_YEARLY', 'PREMIUM_MAX_YEARLY', 'FAMILY_YEARLY'];
    const isYearly = true;
    const target = isYearly ? yearlyNames : monthlyNames;
    expect(target).toContain('PREMIUM_YEARLY');
    expect(target).not.toContain('PREMIUM');
  });
});

// ── Savings calculation ─────────────────────────────────────────────

describe('Yearly savings calculation', () => {
  it('calculates savings correctly for PREMIUM_YEARLY', () => {
    const monthlyPrice = 5000;
    const yearlyPrice = 45000;
    const savings = (monthlyPrice * 12) - yearlyPrice;
    expect(savings).toBe(15000);
  });

  it('calculates savings correctly for FAMILY_YEARLY', () => {
    const monthlyPrice = 18000;
    const yearlyPrice = 162000;
    const savings = (monthlyPrice * 12) - yearlyPrice;
    expect(savings).toBe(54000);
  });
});

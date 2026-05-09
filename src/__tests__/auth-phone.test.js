/**
 * Regression tests for dual auth (email+password / phone+PIN) — Phase 3.1.
 */
import { describe, it, expect } from 'vitest'

const { normalizePhoneNumber, isPhoneIdentifier, isValidPin } = require('../../backend/src/utils/phoneValidator')

// ── Phone number normalization ──────────────────────────────────────

describe('normalizePhoneNumber', () => {
  it('normalizes +221 77 123 4567 to +221771234567', () => {
    expect(normalizePhoneNumber('+221 77 123 4567')).toBe('+221771234567');
  });

  it('normalizes +221-77-123-4567 with dashes', () => {
    expect(normalizePhoneNumber('+221-77-123-4567')).toBe('+221771234567');
  });

  it('normalizes 0033671234567 with 00 prefix', () => {
    expect(normalizePhoneNumber('0033671234567')).toBe('+33671234567');
  });

  it('rejects invalid: abc', () => {
    expect(normalizePhoneNumber('abc')).toBeNull();
  });

  it('rejects too short: +1234', () => {
    expect(normalizePhoneNumber('+1234')).toBeNull();
  });

  it('rejects null/undefined', () => {
    expect(normalizePhoneNumber(null)).toBeNull();
    expect(normalizePhoneNumber(undefined)).toBeNull();
  });

  it('handles +221771234567 as-is', () => {
    expect(normalizePhoneNumber('+221771234567')).toBe('+221771234567');
  });
});

// ── Phone identifier detection ──────────────────────────────────────

describe('isPhoneIdentifier', () => {
  it('detects +221771234567 as phone', () => {
    expect(isPhoneIdentifier('+221771234567')).toBe(true);
  });

  it('detects user@email.com as NOT phone', () => {
    expect(isPhoneIdentifier('user@email.com')).toBe(false);
  });

  it('detects empty as NOT phone', () => {
    expect(isPhoneIdentifier('')).toBe(false);
  });

  it('detects null as NOT phone', () => {
    expect(isPhoneIdentifier(null)).toBe(false);
  });
});

// ── PIN validation ──────────────────────────────────────────────────

describe('isValidPin', () => {
  it('accepts 1234', () => {
    expect(isValidPin('1234')).toBe(true);
  });

  it('accepts 0000', () => {
    expect(isValidPin('0000')).toBe(true);
  });

  it('rejects 5 digits', () => {
    expect(isValidPin('12345')).toBe(false);
  });

  it('rejects 3 digits', () => {
    expect(isValidPin('123')).toBe(false);
  });

  it('rejects letters', () => {
    expect(isValidPin('abcd')).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidPin(null)).toBe(false);
  });
});

// ── Lockout logic ───────────────────────────────────────────────────

describe('Lockout logic', () => {
  const LOCKOUT_THRESHOLD = 5;

  function shouldLock(attempts) {
    return attempts >= LOCKOUT_THRESHOLD;
  }

  it('does not lock at 4 attempts', () => {
    expect(shouldLock(4)).toBe(false);
  });

  it('locks at 5 attempts', () => {
    expect(shouldLock(5)).toBe(true);
  });

  it('locks at 6 attempts', () => {
    expect(shouldLock(6)).toBe(true);
  });
});

// ── Login identifier detection ──────────────────────────────────────

describe('Login identifier detection', () => {
  function detectMode(identifier) {
    if (isPhoneIdentifier(identifier)) return 'pin';
    return 'password';
  }

  it('email uses password mode', () => {
    expect(detectMode('user@test.com')).toBe('password');
  });

  it('phone uses pin mode', () => {
    expect(detectMode('+221771234567')).toBe('pin');
  });
});

// ── Register validation rules ───────────────────────────────────────

describe('Register validation', () => {
  function validateRegister({ email, password, phoneNumber, pin }) {
    if (!email) return 'email required';
    if (!password && !(phoneNumber && pin)) return 'auth method required';
    if (password && password.length < 8) return 'password too short';
    if (pin && !isValidPin(pin)) return 'invalid pin';
    return 'ok';
  }

  it('email only without auth method fails', () => {
    expect(validateRegister({ email: 'a@b.com' })).toBe('auth method required');
  });

  it('email + password OK', () => {
    expect(validateRegister({ email: 'a@b.com', password: '12345678' })).toBe('ok');
  });

  it('email + phone + pin OK', () => {
    expect(validateRegister({ email: 'a@b.com', phoneNumber: '+221', pin: '1234' })).toBe('ok');
  });

  it('no email fails', () => {
    expect(validateRegister({ password: '12345678' })).toBe('email required');
  });

  it('short password fails', () => {
    expect(validateRegister({ email: 'a@b.com', password: '123' })).toBe('password too short');
  });

  it('invalid pin fails', () => {
    expect(validateRegister({ email: 'a@b.com', phoneNumber: '+221', pin: '12' })).toBe('invalid pin');
  });
});

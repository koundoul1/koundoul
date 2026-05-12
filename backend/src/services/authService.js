/**
 * Auth Service — dual email/phone authentication helpers.
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { isPhoneIdentifier } = require('../utils/phoneValidator');

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Find a user by email or phone number.
 * Detects format automatically: @ = email, + = phone.
 */
async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const trimmed = identifier.trim();

  if (isPhoneIdentifier(trimmed)) {
    // Normalize phone to match DB format
    const { normalizePhoneNumber } = require('../utils/phoneValidator');
    const normalized = normalizePhoneNumber(trimmed);
    if (!normalized) return null;
    return prisma.user.findFirst({ where: { phoneNumber: normalized } });
  }
  // Default: email lookup (case-insensitive)
  return prisma.user.findFirst({ where: { email: { equals: trimmed, mode: 'insensitive' } } });
}

/**
 * Verify credentials: password (for email login) or PIN (for phone login).
 * @param {object} user - User record from DB
 * @param {string} credential - password or PIN in cleartext
 * @param {'password'|'pin'} mode - which credential to verify
 * @returns {Promise<boolean>}
 */
async function verifyCredential(user, credential, mode) {
  if (!user || !credential) return false;

  if (mode === 'pin') {
    if (!user.pinHash) return false;
    return bcrypt.compare(credential, user.pinHash);
  }
  // password mode
  if (!user.password) return false;
  return bcrypt.compare(credential, user.password);
}

/**
 * Check if user is currently locked out.
 */
function isLockedOut(user) {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

/**
 * Handle login attempt result: reset or increment failure counter.
 */
async function handleLoginAttempt(userId, success) {
  if (success) {
    await prisma.user.update({
      where: { id: userId },
      data: { loginAttemptsCount: 0, lockedUntil: null }
    });
    return;
  }

  // Failure: increment counter
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttemptsCount: true, lockedUntil: true }
  });

  const newCount = (user.loginAttemptsCount || 0) + 1;
  const data = { loginAttemptsCount: newCount };

  if (newCount >= LOCKOUT_THRESHOLD) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    data.loginAttemptsCount = 0; // reset for next window
  }

  await prisma.user.update({ where: { id: userId }, data });
}

module.exports = {
  findUserByIdentifier,
  verifyCredential,
  isLockedOut,
  handleLoginAttempt,
  LOCKOUT_THRESHOLD,
  LOCKOUT_DURATION_MS
};

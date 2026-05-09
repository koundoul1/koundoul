/**
 * Phone number validation and normalization for E.164 format.
 * Lightweight — no external lib (libphonenumber-js overkill for MVP).
 */

/**
 * Normalize a phone number to E.164 format.
 * Strips spaces, dashes, dots. Validates basic format.
 * @param {string} input - raw phone input
 * @returns {string|null} E.164 formatted number or null if invalid
 */
function normalizePhoneNumber(input) {
  if (!input || typeof input !== 'string') return null;

  // Strip whitespace, dashes, dots, parentheses
  let cleaned = input.replace(/[\s\-\.\(\)]/g, '');

  // Replace leading 00 with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // Must start with + followed by 8-15 digits
  if (!/^\+\d{8,15}$/.test(cleaned)) return null;

  return cleaned;
}

/**
 * Check if an identifier looks like a phone number (starts with +).
 */
function isPhoneIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return false;
  return identifier.trim().startsWith('+');
}

/**
 * Validate a 4-digit PIN.
 */
function isValidPin(pin) {
  if (!pin || typeof pin !== 'string') return false;
  return /^\d{4}$/.test(pin);
}

module.exports = { normalizePhoneNumber, isPhoneIdentifier, isValidPin };

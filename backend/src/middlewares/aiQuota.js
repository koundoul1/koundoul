/**
 * AI Quota Middleware — blocks requests when daily limit is reached.
 * Returns 429 with quota details for frontend upsell display.
 */

const { checkQuota } = require('../services/aiQuotaService');

async function checkAiQuota(req, res, next) {
  try {
    const userId = req.user.userId;
    const quota = await checkQuota(userId);

    if (!quota.allowed) {
      return res.status(429).json({
        error: 'Quota IA quotidien atteint',
        quotaReached: true,
        plan: quota.plan.name,
        limit: quota.limit,
        used: quota.used,
        resetAt: quota.resetAt
      });
    }

    // Attach quota info for downstream use (e.g., incrementUsage after success)
    req.aiQuota = quota;
    next();
  } catch (err) {
    console.error('[aiQuota] Error checking quota:', err.message);
    // Fail open — don't block users if quota service is down
    next();
  }
}

module.exports = { checkAiQuota };

/**
 * AI Quota Service — plan-based daily limits for Solver + Coach.
 *
 * Counts reset at midnight UTC.
 * Family plan: children inherit parent's plan quota.
 */

const prisma = require('../config/database');

// Fallback when no active subscription exists
const FREE_DEFAULTS = {
  id: 'plan-free',
  name: 'FREE',
  displayName: 'Gratuit',
  aiCallsPerDay: 6,
  maxChildren: 0
};

/**
 * Get today's date truncated to UTC midnight (as a Date object for Prisma @db.Date).
 */
function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Next midnight UTC as ISO string (for resetAt field).
 */
function nextMidnightUTC() {
  const tomorrow = todayUTC();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString();
}

/**
 * Get the effective plan for a user.
 * - If user has an active subscription → return that plan.
 * - If user is a child linked to a parent with an active FAMILY plan → return the parent's plan.
 * - Otherwise → return FREE defaults.
 */
async function getUserPlan(userId) {
  // 1. Check user's own active subscription
  const ownSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'active'] },
      endDate: { gte: new Date() }
    },
    include: { plan: true },
    orderBy: { endDate: 'desc' }
  });

  if (ownSub?.plan) {
    return ownSub.plan;
  }

  // 2. Check if user is a child with a parent who has a FAMILY plan
  const parentLink = await prisma.parent_child_links.findFirst({
    where: { child_id: userId, approved: true }
  });

  if (parentLink) {
    const parentSub = await prisma.subscription.findFirst({
      where: {
        userId: parentLink.parent_id,
        status: { in: ['ACTIVE', 'active'] },
        endDate: { gte: new Date() }
      },
      include: { plan: true },
      orderBy: { endDate: 'desc' }
    });

    if (parentSub?.plan && (parentSub.plan.name === 'FAMILY' || parentSub.plan.name === 'FAMILY_YEARLY')) {
      return parentSub.plan;
    }
  }

  // 3. Fallback to FREE
  // Try to load from DB for consistent fields, fallback to hardcoded defaults
  const freePlan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'FREE', isActive: true }
  });
  return freePlan || FREE_DEFAULTS;
}

/**
 * Check if a user can make an AI call right now.
 * Returns quota status object.
 */
async function checkQuota(userId) {
  const plan = await getUserPlan(userId);
  const today = todayUTC();

  const usage = await prisma.dailyAiUsage.findUnique({
    where: { userId_date: { userId, date: today } }
  });

  const used = usage?.count ?? 0;
  const limit = plan.aiCallsPerDay ?? FREE_DEFAULTS.aiCallsPerDay;
  const allowed = used < limit;

  // Check if this user is a child of a family plan
  const parentLink = await prisma.parent_child_links.findFirst({
    where: { child_id: userId, approved: true }
  });

  return {
    allowed,
    plan: {
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      aiCallsPerDay: limit,
      maxChildren: plan.maxChildren ?? 0
    },
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetAt: nextMidnightUTC(),
    isChild: !!parentLink
  };
}

/**
 * Increment today's AI usage counter for a user.
 * Uses upsert for atomicity — safe under concurrent calls.
 * Call AFTER a successful Gemini response, not before.
 */
async function incrementUsage(userId) {
  const today = todayUTC();
  await prisma.dailyAiUsage.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, count: 1 },
    update: { count: { increment: 1 } }
  });
}

module.exports = {
  getUserPlan,
  checkQuota,
  incrementUsage,
  todayUTC,
  nextMidnightUTC
};

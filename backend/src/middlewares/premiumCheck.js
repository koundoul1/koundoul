/**
 * Premium check utilities for feature gating.
 * Returns user plan info without blocking — let routes decide what to restrict.
 */

var prisma = require('../config/database');

async function getUserPlanInfo(userId) {
  var now = new Date();
  var sub = await prisma.subscription.findFirst({
    where: { userId: userId, status: { in: ['ACTIVE', 'active'] }, endDate: { gte: now } },
    include: { plan: true },
    orderBy: { endDate: 'desc' }
  });

  if (sub && sub.plan) {
    return {
      isPremium: true,
      planName: sub.plan.name,
      displayName: sub.plan.displayName || sub.plan.name,
      aiCallsPerDay: sub.plan.aiCallsPerDay || 50
    };
  }

  // Check parent family plan
  var parentLink = await prisma.parent_child_links.findFirst({
    where: { child_id: userId, approved: true }
  });
  if (parentLink) {
    var parentSub = await prisma.subscription.findFirst({
      where: { userId: parentLink.parent_id, status: { in: ['ACTIVE', 'active'] }, endDate: { gte: now } },
      include: { plan: true }
    });
    if (parentSub && (parentSub.plan.name === 'FAMILY' || parentSub.plan.name === 'FAMILY_YEARLY')) {
      return {
        isPremium: true,
        planName: parentSub.plan.name,
        displayName: 'Famille',
        aiCallsPerDay: parentSub.plan.aiCallsPerDay || 100
      };
    }
  }

  return { isPremium: false, planName: 'FREE', displayName: 'Gratuit', aiCallsPerDay: 6 };
}

async function countTodayUsage(userId, type) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (type) {
    case 'duel':
      return prisma.duel.count({
        where: { challengerId: userId, createdAt: { gte: today } }
      });
    case 'flashcard_review':
      return prisma.flashcardReview.count({
        where: { userId: userId, reviewedAt: { gte: today } }
      });
    default:
      return 0;
  }
}

module.exports = { getUserPlanInfo, countTodayUsage };

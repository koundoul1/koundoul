/**
 * Subscription Expiry Job — runs daily at 00:05 UTC.
 * 1. Expires subscriptions past their endDate
 * 2. Sends warning notification 3 days before expiry
 * 3. Sends expiry notification on the day
 */

const cron = require('node-cron');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

async function expireSubscriptions() {
  try {
    const now = new Date();

    // 1. Find and expire overdue active subscriptions
    const expired = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        endDate: { lt: now }
      },
      include: {
        user: { select: { id: true, firstName: true, email: true } },
        plan: { select: { name: true, displayName: true } }
      }
    });

    if (expired.length > 0) {
      await prisma.subscription.updateMany({
        where: { id: { in: expired.map(s => s.id) } },
        data: { status: 'expired' }
      });

      // Notify each expired user
      for (const sub of expired) {
        try {
          await sendNotification(
            sub.userId,
            'Abonnement expire',
            `Ton abonnement ${sub.plan?.displayName || sub.plan?.name} a expire. Renouvelle pour continuer a profiter des fonctionnalites premium !`,
            '/subscriptions'
          );
        } catch (e) { /* ignore notification errors */ }
      }

      console.log(`[SubscriptionExpiry] ${expired.length} abonnement(s) expire(s)`);
    }

    // 2. Warn users 3 days before expiry
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'ACTIVE'] },
        endDate: { gte: threeDaysStart, lte: threeDaysEnd }
      },
      include: {
        user: { select: { id: true, firstName: true } },
        plan: { select: { displayName: true, name: true } }
      }
    });

    for (const sub of expiringSoon) {
      try {
        const endStr = new Date(sub.endDate).toLocaleDateString('fr-FR');
        await sendNotification(
          sub.userId,
          'Abonnement bientot expire',
          `Ton abonnement ${sub.plan?.displayName || sub.plan?.name} expire le ${endStr}. Renouvelle maintenant pour ne pas perdre tes avantages !`,
          '/subscriptions'
        );
      } catch (e) { /* ignore */ }
    }

    if (expiringSoon.length > 0) {
      console.log(`[SubscriptionExpiry] ${expiringSoon.length} rappel(s) d'expiration envoye(s)`);
    }

    return { expired: expired.length, warned: expiringSoon.length };
  } catch (error) {
    console.error('[SubscriptionExpiry] Error:', error.message);
    return { error: error.message };
  }
}

function setupSubscriptionExpiryJob() {
  // Run daily at 00:05 UTC
  cron.schedule('5 0 * * *', async () => {
    console.log('[SubscriptionExpiry] Running daily check...');
    const result = await expireSubscriptions();
    console.log('[SubscriptionExpiry] Done:', result);
  });

  // Also run once on startup (catch any missed expirations)
  setTimeout(() => {
    console.log('[SubscriptionExpiry] Startup catch-up...');
    expireSubscriptions();
  }, 10000);

  console.log('Cron: subscription expiry check scheduled (daily 00:05 UTC)');
}

module.exports = { setupSubscriptionExpiryJob, expireSubscriptions };

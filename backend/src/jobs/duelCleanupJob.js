/**
 * Duel Cleanup Job — expires stale duels every 5 minutes.
 * Marks duels as 'expired' if expiresAt < now and status is pending/active.
 */

const cron = require('node-cron');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

async function expireStaleDuels() {
  try {
    const now = new Date();

    // Find stale duels
    const staleDuels = await prisma.duel.findMany({
      where: {
        status: { in: ['pending', 'active'] },
        expiresAt: { lt: now }
      },
      select: { id: true, challengerId: true, subject: true }
    });

    if (staleDuels.length === 0) return 0;

    // Batch update
    await prisma.duel.updateMany({
      where: { id: { in: staleDuels.map(d => d.id) } },
      data: { status: 'expired' }
    });

    // Notify challengers
    for (const duel of staleDuels) {
      sendNotification(
        duel.challengerId,
        'duel_invite',
        'Duel expire',
        'Ton duel de ' + duel.subject + ' a expire sans adversaire.',
        { duelId: duel.id }
      ).catch(() => {});
    }

    if (staleDuels.length > 0) {
      console.log('[DuelCleanup] ' + staleDuels.length + ' duel(s) expires.');
    }
    return staleDuels.length;
  } catch (err) {
    console.error('[DuelCleanup] Error:', err.message);
    return 0;
  }
}

function setupDuelCleanupJob() {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    expireStaleDuels();
  }, { timezone: 'UTC' });

  console.log('Duel cleanup cron scheduled (every 5 min)');

  // Run once at startup
  expireStaleDuels();
}

module.exports = { expireStaleDuels, setupDuelCleanupJob };

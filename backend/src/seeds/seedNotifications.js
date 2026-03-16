/**
 * Seed test notifications for admin user
 * Usage: node backend/src/seeds/seedNotifications.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find admin user
  const admin = await prisma.user.findFirst({ where: { is_admin: true } });
  if (!admin) {
    console.log('No admin user found');
    return;
  }

  console.log(`Seeding notifications for ${admin.username} (${admin.id})...`);

  const notifications = [
    {
      userId: admin.id,
      type: 'badge_earned',
      title: 'Nouveau badge !',
      message: 'Tu as débloqué le badge "Mathématicien en herbe" pour avoir résolu 50 exercices.',
      data: { badgeId: 'math-50' },
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 min ago
    },
    {
      userId: admin.id,
      type: 'duel_invite',
      title: 'Défi lancé !',
      message: 'Amadou t\'a défié en Physique. Relève le challenge !',
      data: { duelId: 'test-duel-1' },
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 min ago
    },
    {
      userId: admin.id,
      type: 'streak_reminder',
      title: 'Garde ta série !',
      message: 'Ta série de 7 jours est en danger ! Fais un exercice pour la maintenir.',
      data: { streakCount: 7 },
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2h ago
    },
    {
      userId: admin.id,
      type: 'level_up',
      title: 'Niveau supérieur !',
      message: 'Félicitations ! Tu es passé au niveau 5. Continue comme ça !',
      data: { newLevel: 5 },
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      userId: admin.id,
      type: 'challenge_start',
      title: 'Challenge hebdomadaire',
      message: 'Le challenge "Maître des équations" commence maintenant ! 50 participants inscrits.',
      data: { challengeId: 'test-challenge-1' },
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ];

  await prisma.notification.createMany({ data: notifications });
  console.log(`Created ${notifications.length} test notifications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

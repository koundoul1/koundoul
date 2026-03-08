const prisma = require('../config/database');

const BADGES = [
  {
    name: 'Première Leçon',
    description: 'Compléter votre première micro-leçon',
    icon: '🎯',
    condition: 'complete_lesson:1',
    points: 50
  },
  {
    name: '10 Leçons',
    description: 'Compléter 10 micro-leçons',
    icon: '📖',
    condition: 'complete_lesson:10',
    points: 100
  },
  {
    name: '50 Leçons',
    description: 'Compléter 50 micro-leçons',
    icon: '📚',
    condition: 'complete_lesson:50',
    points: 250
  },
  {
    name: '100 Leçons',
    description: 'Compléter 100 micro-leçons',
    icon: '🎓',
    condition: 'complete_lesson:100',
    points: 500
  },
  {
    name: '3 Jours Consécutifs',
    description: 'Étudier 3 jours de suite',
    icon: '🔥',
    condition: 'streak:3',
    points: 50
  },
  {
    name: '7 Jours Consécutifs',
    description: 'Étudier 7 jours de suite',
    icon: '💪',
    condition: 'streak:7',
    points: 100
  },
  {
    name: '30 Jours Consécutifs',
    description: 'Étudier 30 jours de suite',
    icon: '👑',
    condition: 'streak:30',
    points: 500
  },
  {
    name: 'Expert Maths',
    description: 'Compléter 20 leçons de Maths',
    icon: '➗',
    condition: 'subject:Mathématiques:20',
    points: 200
  },
  {
    name: 'Expert Physique',
    description: 'Compléter 20 leçons de Physique',
    icon: '⚡',
    condition: 'subject:Physique:20',
    points: 200
  },
  {
    name: 'Expert Chimie',
    description: 'Compléter 20 leçons de Chimie',
    icon: '🧪',
    condition: 'subject:Chimie:20',
    points: 200
  },
  {
    name: 'As de Seconde',
    description: 'Compléter 15 leçons niveau Seconde',
    icon: '🥉',
    condition: 'level_mastery:Seconde:15',
    points: 150
  },
  {
    name: 'Champion Première',
    description: 'Compléter 15 leçons niveau Première',
    icon: '🥈',
    condition: 'level_mastery:Première:15',
    points: 200
  },
  {
    name: 'Maître Terminale',
    description: 'Compléter 15 leçons niveau Terminale',
    icon: '🥇',
    condition: 'level_mastery:Terminale:15',
    points: 300
  },
  {
    name: 'Premier Quiz Parfait',
    description: 'Obtenir 100% à un quiz',
    icon: '💯',
    condition: 'perfect_quiz:1',
    points: 150
  },
  {
    name: 'Persévérant',
    description: 'Ne jamais abandonner — 25 leçons complétées',
    icon: '🛡️',
    condition: 'complete_lesson:25',
    points: 175
  }
];

async function seedBadges() {
  console.log('🏅 Seeding badges...');

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {
        description: badge.description,
        icon: badge.icon,
        condition: badge.condition,
        points: badge.points
      },
      create: badge
    });
  }

  console.log(`✅ ${BADGES.length} badges seeded successfully`);
}

module.exports = seedBadges;

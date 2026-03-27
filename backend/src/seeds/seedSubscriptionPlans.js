const prisma = require('../config/database');

const PLANS = [
  {
    name: 'DAILY',
    displayName: 'Journalier',
    description: 'Accès complet pendant 24h',
    price: 100,
    currency: 'xof',
    duration: 1,
    interval: 'daily',
    features: [
      'Accès illimité au Solver IA',
      'Coach IA personnalisé',
      'Quiz et exercices illimités',
      'Flashcards intelligentes'
    ],
    isActive: true,
    sortOrder: 1
  }
];

async function seedSubscriptionPlans() {
  console.log('📋 Seeding subscription plans...');

  for (const plan of PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        interval: plan.interval,
        features: plan.features,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder
      },
      create: plan
    });
    console.log(`  ✅ Plan "${plan.displayName}" créé/mis à jour`);
  }

  console.log('📋 Subscription plans seeded!');
}

module.exports = seedSubscriptionPlans;

/**
 * Initialise les plans d'abonnement dans la base de données.
 * Idempotent : upsert par ID. Les anciens plans non listés sont désactivés.
 * Usage: node src/scripts/initPlans.js  (ou appelé au démarrage du serveur)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLANS = [
  {
    id: 'plan-free',
    name: 'FREE',
    displayName: 'Gratuit',
    description: 'Accès complet aux contenus avec IA limitée',
    price: 0,
    currency: 'XOF',
    duration: 30,
    interval: 'monthly',
    aiCallsPerDay: 6,
    maxChildren: 0,
    features: [
      '6 appels IA par jour (Solver + Coach)',
      '1800 exercices corrigés',
      '450 micro-leçons',
      'Quiz et défis',
      'Forum communautaire',
      'Badges et XP'
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'plan-premium',
    name: 'PREMIUM',
    displayName: 'Premium',
    description: '50 appels IA/jour + fonctionnalités avancées',
    price: 5000,
    currency: 'XOF',
    duration: 30,
    interval: 'monthly',
    aiCallsPerDay: 50,
    maxChildren: 0,
    features: [
      '50 appels IA par jour',
      'Duels en ligne',
      'Statistiques avancées',
      'Téléchargement PDF des solutions',
      'Tous les exercices et leçons'
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'plan-premium-yearly',
    name: 'PREMIUM_YEARLY',
    displayName: 'Premium Annuel',
    description: 'Premium avec 2 mois offerts',
    price: 45000,
    currency: 'XOF',
    duration: 365,
    interval: 'yearly',
    aiCallsPerDay: 50,
    maxChildren: 0,
    features: [
      '50 appels IA par jour',
      'Duels en ligne',
      'Statistiques avancées',
      'Téléchargement PDF des solutions',
      'Économie de 2 mois'
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'plan-premium-max',
    name: 'PREMIUM_MAX',
    displayName: 'Premium Max',
    description: '300 appels IA/jour pour les gros utilisateurs',
    price: 10000,
    currency: 'XOF',
    duration: 30,
    interval: 'monthly',
    aiCallsPerDay: 300,
    maxChildren: 0,
    features: [
      '300 appels IA par jour',
      'Duels en ligne',
      'Statistiques avancées',
      'Téléchargement PDF des solutions',
      'Tous les exercices et leçons',
      'Priorité support'
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'plan-premium-max-yearly',
    name: 'PREMIUM_MAX_YEARLY',
    displayName: 'Premium Max Annuel',
    description: 'Premium Max avec 2 mois offerts',
    price: 90000,
    currency: 'XOF',
    duration: 365,
    interval: 'yearly',
    aiCallsPerDay: 300,
    maxChildren: 0,
    features: [
      '300 appels IA par jour',
      'Duels en ligne',
      'Statistiques avancées',
      'Téléchargement PDF des solutions',
      'Économie de 2 mois',
      'Priorité support'
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'plan-family',
    name: 'FAMILY',
    displayName: 'Famille',
    description: '100 appels IA/jour par enfant + dashboard parent',
    price: 18000,
    currency: 'XOF',
    duration: 30,
    interval: 'monthly',
    aiCallsPerDay: 100,
    maxChildren: 3,
    features: [
      '100 appels IA par jour par enfant',
      'Jusqu\'à 3 comptes enfants',
      'Dashboard parent avec suivi détaillé',
      'Tous les exercices et leçons',
      'Duels en ligne',
      'Statistiques avancées'
    ],
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'plan-family-yearly',
    name: 'FAMILY_YEARLY',
    displayName: 'Famille Annuel',
    description: 'Famille avec 2 mois offerts',
    price: 162000,
    currency: 'XOF',
    duration: 365,
    interval: 'yearly',
    aiCallsPerDay: 100,
    maxChildren: 3,
    features: [
      '100 appels IA par jour par enfant',
      'Jusqu\'à 3 comptes enfants',
      'Dashboard parent avec suivi détaillé',
      'Économie de 2 mois',
      'Duels en ligne',
      'Statistiques avancées'
    ],
    isActive: true,
    sortOrder: 7
  }
];

// IDs of the new active plans
const ACTIVE_PLAN_IDS = PLANS.map(p => p.id);

async function initPlans() {
  try {
    console.log('🔄 Initialisation des plans d\'abonnement...\n');

    for (const plan of PLANS) {
      const existing = await prisma.subscriptionPlan.findUnique({
        where: { id: plan.id }
      });

      if (existing) {
        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: plan
        });
        console.log(`✅ Plan "${plan.displayName}" mis à jour`);
      } else {
        await prisma.subscriptionPlan.create({
          data: plan
        });
        console.log(`✅ Plan "${plan.displayName}" créé`);
      }
    }

    // Deactivate old plans not in the new list (but don't delete — may have active subscriptions)
    const deactivated = await prisma.subscriptionPlan.updateMany({
      where: {
        id: { notIn: ACTIVE_PLAN_IDS },
        isActive: true
      },
      data: { isActive: false }
    });
    if (deactivated.count > 0) {
      console.log(`⚠️  ${deactivated.count} ancien(s) plan(s) désactivé(s)`);
    }

    console.log('\n✨ Initialisation terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { initPlans };

if (require.main === module) {
  initPlans();
}

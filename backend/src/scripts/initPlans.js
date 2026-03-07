/**
 * Script pour initialiser les plans d'abonnement dans la base de données
 * Usage: node src/scripts/initPlans.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  {
    id: 'plan-free',
    name: 'FREE',
    displayName: 'Gratuit',
    description: 'Accès aux fonctionnalités de base',
    price: 0,
    currency: 'XOF',
    interval: 'monthly',
    features: [
      'Accès aux 1800 exercices',
      'Accès aux 450 micro-leçons',
      'Résolveur IA (limité à 10 résolutions/jour)',
      'Quiz et défis',
      'Forum communautaire',
      'Badges et XP'
    ],
    isActive: true,
    sortOrder: 0
  },
  {
    id: 'plan-premium',
    name: 'PREMIUM',
    displayName: 'Premium',
    description: 'Résolution illimitée + Fonctionnalités avancées',
    price: 5000, // 5000 XOF = ~7.5€
    currency: 'XOF',
    interval: 'monthly',
    features: [
      'Tout du plan Gratuit',
      'Résolveur IA illimité',
      'Mode guidé avancé avec 3 niveaux d\'indices',
      'Analyse d\'erreurs intelligente',
      'Graphiques interactifs Plotly',
      'Profils d\'apprentissage personnalisés',
      'Espace de travail illimité',
      'Priorité support',
      'Accès anticipé aux nouvelles fonctionnalités'
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'plan-family',
    name: 'FAMILY',
    displayName: 'Famille',
    description: 'Accès parents + Multi-comptes enfants',
    price: 10000, // 10000 XOF = ~15€
    currency: 'XOF',
    interval: 'monthly',
    features: [
      'Tout du plan Premium',
      'Dashboard parents avec suivi détaillé',
      'Jusqu\'à 5 comptes enfants',
      'Alertes et notifications intelligentes',
      'Rapports de progression hebdomadaires',
      'Recommandations personnalisées par enfant',
      'Gestion centralisée des abonnements',
      'Support prioritaire famille'
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'plan-premium-yearly',
    name: 'PREMIUM_YEARLY',
    displayName: 'Premium Annuel',
    description: 'Premium avec économie de 2 mois',
    price: 50000, // 50000 XOF = ~75€ (au lieu de 60000)
    currency: 'XOF',
    interval: 'yearly',
    features: [
      'Tout du plan Premium',
      'Économie de 2 mois',
      'Badge exclusif "Membre Premium"',
      'Support prioritaire'
    ],
    isActive: true,
    sortOrder: 3
  }
];

async function initPlans() {
  try {
    console.log('🔄 Initialisation des plans d\'abonnement...\n');

    for (const plan of plans) {
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

    console.log('\n✨ Initialisation terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export pour pouvoir être appelé depuis le serveur
module.exports = {
  initPlans
};

// Exécution directe uniquement si le fichier est lancé en script
if (require.main === module) {
  initPlans();
}



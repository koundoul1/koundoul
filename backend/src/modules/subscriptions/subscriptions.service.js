import prismaService from '../../database/prisma.js';

/**
 * Service pour gérer les abonnements
 */
class SubscriptionsService {
  /**
   * Obtenir tous les plans d'abonnement actifs
   */
  async getActivePlans() {
    try {
      // Récupérer tous les plans en sélectionnant uniquement les colonnes qui existent
      // La colonne isActive n'existe peut-être pas encore dans la base de données
      const plans = await prismaService.client.subscriptionPlan.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          currency: true,
          duration: true,
          features: true,
          createdAt: true,
          updatedAt: true
          // Ne pas sélectionner isActive car la colonne peut ne pas exister
        },
        orderBy: { price: 'asc' }
      });
      
      // Retourner tous les plans (pas de filtre isActive)
      return { success: true, data: plans };
    } catch (error) {
      console.error('❌ Error getting subscription plans:', error);
      // En cas d'erreur, essayer sans select pour récupérer ce qui est disponible
      try {
        const plans = await prismaService.client.$queryRaw`
          SELECT id, name, description, price, currency, duration, features, 
                 "createdAt", "updatedAt"
          FROM subscription_plans
          ORDER BY price ASC
        `;
        return { success: true, data: plans };
      } catch (rawError) {
        console.error('❌ Error with raw query:', rawError);
        return { success: false, error: error.message };
      }
    }
  }

  /**
   * Obtenir l'abonnement actif d'un utilisateur
   */
  async getUserActiveSubscription(userId) {
    try {
      const subscription = await prismaService.client.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          endDate: { gte: new Date() }
        },
        include: {
          plan: true,
          payments: {
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, data: subscription };
    } catch (error) {
      console.error('❌ Error getting user subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un nouvel abonnement
   */
  async createSubscription(userId, planId, autoRenew = false) {
    try {
      // Vérifier que le plan existe
      const plan = await prismaService.client.subscriptionPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        return { success: false, error: 'Plan d\'abonnement introuvable' };
      }

      // Calculer la date de fin
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      // Désactiver les autres abonnements actifs
      await prismaService.client.subscription.updateMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // Créer le nouvel abonnement
      const subscription = await prismaService.client.subscription.create({
        data: {
          userId,
          planId,
          endDate,
          autoRenew,
          status: 'PENDING_PAYMENT'
        },
        include: {
          plan: true
        }
      });

      return { success: true, data: subscription };
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Activer un abonnement après paiement réussi
   */
  async activateSubscription(subscriptionId) {
    try {
      const subscription = await prismaService.client.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          startDate: new Date()
        },
        include: {
          plan: true
        }
      });

      return { success: true, data: subscription };
    } catch (error) {
      console.error('❌ Error activating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Annuler un abonnement
   */
  async cancelSubscription(subscriptionId, userId) {
    try {
      const subscription = await prismaService.client.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId
        }
      });

      if (!subscription) {
        return { success: false, error: 'Abonnement introuvable' };
      }

      const cancelled = await prismaService.client.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELLED',
          autoRenew: false,
          cancelledAt: new Date()
        }
      });

      return { success: true, data: cancelled };
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir l'historique des abonnements d'un utilisateur
   */
  async getUserSubscriptionHistory(userId) {
    try {
      const subscriptions = await prismaService.client.subscription.findMany({
        where: { userId },
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, data: subscriptions };
    } catch (error) {
      console.error('❌ Error getting subscription history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifier et mettre à jour les abonnements expirés
   */
  async checkExpiredSubscriptions() {
    try {
      const expired = await prismaService.client.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: { lt: new Date() }
        },
        data: {
          status: 'EXPIRED'
        }
      });

      return { success: true, data: { count: expired.count } };
    } catch (error) {
      console.error('❌ Error checking expired subscriptions:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SubscriptionsService();

import subscriptionsService from './subscriptions.service.js';

class SubscriptionsController {
  /**
   * GET /api/subscriptions/plans
   * Obtenir tous les plans d'abonnement actifs
   */
  async getPlans(req, res) {
    try {
      const result = await subscriptionsService.getActivePlans();
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getPlans controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/subscriptions/my-subscription
   * Obtenir l'abonnement actif de l'utilisateur connecté
   */
  async getMySubscription(req, res) {
    try {
      const userId = req.user.id;
      const result = await subscriptionsService.getUserActiveSubscription(userId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getMySubscription controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/subscriptions/history
   * Obtenir l'historique des abonnements de l'utilisateur
   */
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const result = await subscriptionsService.getUserSubscriptionHistory(userId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getHistory controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * POST /api/subscriptions/create
   * Créer un nouvel abonnement (avant paiement)
   */
  async createSubscription(req, res) {
    try {
      const { planId, autoRenew } = req.body;
      const userId = req.user.id;

      if (!planId) {
        return res.status(400).json({
          success: false,
          error: { message: 'PlanId requis' }
        });
      }

      const result = await subscriptionsService.createSubscription(
        userId,
        planId,
        autoRenew || false
      );
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in createSubscription controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * POST /api/subscriptions/:id/cancel
   * Annuler un abonnement
   */
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await subscriptionsService.cancelSubscription(id, userId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in cancelSubscription controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }
}

export default new SubscriptionsController();

import paymentsService from './payments.service.js';
import subscriptionsService from '../subscriptions/subscriptions.service.js';
import prismaService from '../../database/prisma.js';

class PaymentsController {
  /**
   * POST /api/payments/stripe/create-intent
   * Créer une intention de paiement Stripe
   */
  async createStripePaymentIntent(req, res) {
    try {
      const { subscriptionId, planId } = req.body;
      const userId = req.user.id;

      if (!subscriptionId && !planId) {
        return res.status(400).json({
          success: false,
          error: { message: 'subscriptionId ou planId requis' }
        });
      }

      let subscription;
      if (planId && !subscriptionId) {
        // Créer l'abonnement d'abord
        const subResult = await subscriptionsService.createSubscription(userId, planId);
        if (!subResult.success) {
          return res.status(400).json({
            success: false,
            error: { message: subResult.error }
          });
        }
        subscription = subResult.data;
      } else {
        // Récupérer l'abonnement existant
        const sub = await prismaService.client.subscription.findUnique({
          where: { id: subscriptionId },
          include: { plan: true }
        });
        if (!sub) {
          return res.status(404).json({
            success: false,
            error: { message: 'Abonnement introuvable' }
          });
        }
        subscription = sub;
      }

      const amount = subscription.plan.price;
      const currency = subscription.plan.currency === 'xof' ? 'xof' : 'eur';

      // Convertir en centimes pour Stripe (Stripe utilise des centimes pour EUR mais pas pour XOF)
      // Pour XOF, on garde le montant tel quel (Wave/OM utilisent des francs CFA)
      const stripeAmount = currency === 'eur' ? amount : amount;

      const result = await paymentsService.createStripePaymentIntent(
        userId,
        subscription.id,
        stripeAmount,
        currency
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
      console.error('❌ Error in createStripePaymentIntent controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * POST /api/payments/wave/create
   * Créer un paiement Wave
   */
  async createWavePayment(req, res) {
    try {
      const { subscriptionId, planId, phoneNumber } = req.body;
      const userId = req.user.id;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: { message: 'Numéro de téléphone requis' }
        });
      }

      let subscription;
      if (planId && !subscriptionId) {
        const subResult = await subscriptionsService.createSubscription(userId, planId);
        if (!subResult.success) {
          return res.status(400).json({
            success: false,
            error: { message: subResult.error }
          });
        }
        subscription = subResult.data;
      } else {
        const sub = await prismaService.client.subscription.findUnique({
          where: { id: subscriptionId },
          include: { plan: true }
        });
        if (!sub) {
          return res.status(404).json({
            success: false,
            error: { message: 'Abonnement introuvable' }
          });
        }
        subscription = sub;
      }

      const amount = subscription.plan.price;

      const result = await paymentsService.createWavePayment(
        userId,
        subscription.id,
        amount,
        phoneNumber
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
      console.error('❌ Error in createWavePayment controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * POST /api/payments/orange-money/create
   * Créer un paiement Orange Money
   */
  async createOrangeMoneyPayment(req, res) {
    try {
      const { subscriptionId, planId, phoneNumber } = req.body;
      const userId = req.user.id;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: { message: 'Numéro de téléphone requis' }
        });
      }

      let subscription;
      if (planId && !subscriptionId) {
        const subResult = await subscriptionsService.createSubscription(userId, planId);
        if (!subResult.success) {
          return res.status(400).json({
            success: false,
            error: { message: subResult.error }
          });
        }
        subscription = subResult.data;
      } else {
        const sub = await prismaService.client.subscription.findUnique({
          where: { id: subscriptionId },
          include: { plan: true }
        });
        if (!sub) {
          return res.status(404).json({
            success: false,
            error: { message: 'Abonnement introuvable' }
          });
        }
        subscription = sub;
      }

      const amount = subscription.plan.price;

      const result = await paymentsService.createOrangeMoneyPayment(
        userId,
        subscription.id,
        amount,
        phoneNumber
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
      console.error('❌ Error in createOrangeMoneyPayment controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/payments/my-payments
   * Obtenir l'historique des paiements de l'utilisateur
   */
  async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const result = await paymentsService.getUserPayments(userId);

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
      console.error('❌ Error in getMyPayments controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }
}

export default new PaymentsController();

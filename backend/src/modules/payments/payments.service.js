import prismaService from '../../database/prisma.js';
import stripeService from './stripe.service.js';
import subscriptionsService from '../subscriptions/subscriptions.service.js';

/**
 * Service pour gérer les paiements (Stripe, Wave, Orange Money)
 */
class PaymentsService {
  /**
   * Créer une intention de paiement Stripe
   */
  async createStripePaymentIntent(userId, subscriptionId, amount, currency = 'eur') {
    try {
      // Créer l'intention de paiement Stripe
      const paymentIntent = await stripeService.createPaymentIntent(amount, currency, {
        userId,
        subscriptionId
      });

      // Créer l'enregistrement de paiement en base
      const payment = await prismaService.client.payment.create({
        data: {
          userId,
          subscriptionId,
          amount,
          currency,
          paymentType: 'STRIPE',
          stripeId: paymentIntent.id,
          status: 'PENDING',
          description: `Abonnement - ${amount / 100} ${currency.toUpperCase()}`
        }
      });

      return {
        success: true,
        data: {
          payment,
          clientSecret: paymentIntent.client_secret
        }
      };
    } catch (error) {
      console.error('❌ Error creating Stripe payment intent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une intention de paiement Wave
   */
  async createWavePayment(userId, subscriptionId, amount, phoneNumber) {
    try {
      if (!phoneNumber) {
        return { success: false, error: 'Numéro de téléphone requis pour Wave' };
      }

      // TODO: Intégrer avec l'API Wave Sénégal
      // Pour l'instant, on crée juste l'enregistrement en base
      const payment = await prismaService.client.payment.create({
        data: {
          userId,
          subscriptionId,
          amount,
          currency: 'xof',
          paymentType: 'WAVE',
          status: 'PENDING',
          description: `Abonnement - ${amount / 100} XOF (Wave)`,
          metadata: {
            phoneNumber,
            provider: 'wave'
          }
        }
      });

      // TODO: Appeler l'API Wave pour créer la transaction
      // const waveResponse = await waveService.createTransaction(amount, phoneNumber, payment.id);
      // await prismaService.client.payment.update({
      //   where: { id: payment.id },
      //   data: { waveId: waveResponse.id }
      // });

      return {
        success: true,
        data: {
          payment,
          message: 'Paiement Wave initié. Veuillez confirmer sur votre application Wave.'
        }
      };
    } catch (error) {
      console.error('❌ Error creating Wave payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une intention de paiement Orange Money
   */
  async createOrangeMoneyPayment(userId, subscriptionId, amount, phoneNumber) {
    try {
      if (!phoneNumber) {
        return { success: false, error: 'Numéro de téléphone requis pour Orange Money' };
      }

      // TODO: Intégrer avec l'API Orange Money
      const payment = await prismaService.client.payment.create({
        data: {
          userId,
          subscriptionId,
          amount,
          currency: 'xof',
          paymentType: 'ORANGE_MONEY',
          status: 'PENDING',
          description: `Abonnement - ${amount / 100} XOF (Orange Money)`,
          metadata: {
            phoneNumber,
            provider: 'orange_money'
          }
        }
      });

      // TODO: Appeler l'API Orange Money pour créer la transaction
      // const omResponse = await orangeMoneyService.createTransaction(amount, phoneNumber, payment.id);
      // await prismaService.client.payment.update({
      //   where: { id: payment.id },
      //   data: { orangeMoneyId: omResponse.id }
      // });

      return {
        success: true,
        data: {
          payment,
          message: 'Paiement Orange Money initié. Veuillez confirmer via USSD ou l\'application Orange Money.'
        }
      };
    } catch (error) {
      console.error('❌ Error creating Orange Money payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Confirmer un paiement (appelé par webhook ou callback)
   */
  async confirmPayment(paymentId, paymentData = {}) {
    try {
      const payment = await prismaService.client.payment.findUnique({
        where: { id: paymentId },
        include: { subscription: true }
      });

      if (!payment) {
        return { success: false, error: 'Paiement introuvable' };
      }

      // Mettre à jour le statut du paiement
      const updatedPayment = await prismaService.client.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          ...paymentData
        }
      });

      // Activer l'abonnement si c'est un paiement d'abonnement
      if (payment.subscriptionId) {
        await subscriptionsService.activateSubscription(payment.subscriptionId);
      }

      return { success: true, data: updatedPayment };
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir l'historique des paiements d'un utilisateur
   */
  async getUserPayments(userId) {
    try {
      const payments = await prismaService.client.payment.findMany({
        where: { userId },
        include: {
          subscription: {
            include: { plan: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, data: payments };
    } catch (error) {
      console.error('❌ Error getting user payments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir un paiement par ID
   */
  async getPaymentById(paymentId) {
    try {
      const payment = await prismaService.client.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: {
            include: { plan: true }
          },
          user: {
            select: { id: true, email: true, username: true }
          }
        }
      });

      if (!payment) {
        return { success: false, error: 'Paiement introuvable' };
      }

      return { success: true, data: payment };
    } catch (error) {
      console.error('❌ Error getting payment:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PaymentsService();

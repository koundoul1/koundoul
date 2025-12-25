import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  /**
   * Créer une intention de paiement
   */
  async createPaymentIntent(amount, currency = 'eur', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('❌ Stripe error:', error);
      throw error;
    }
  }

  /**
   * Récupérer une intention de paiement
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('❌ Stripe error:', error);
      throw error;
    }
  }

  /**
   * Vérifier la signature du webhook Stripe
   */
  verifyWebhookSignature(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      throw error;
    }
  }
}

export default new StripeService();

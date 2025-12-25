import express from 'express';
import paymentsController from './payments.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import paymentsService from './payments.service.js';
import stripeService from './stripe.service.js';
import subscriptionsService from '../subscriptions/subscriptions.service.js';
import prismaService from '../../database/prisma.js';

const router = express.Router();

// Route webhook Stripe (ne nécessite pas d'authentification JWT)
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripeService.verifyWebhookSignature(req.body, sig);

      // Gérer l'événement
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        // Trouver le paiement dans notre base de données
        const payment = await prismaService.client.payment.findUnique({
          where: { stripeId: paymentIntent.id }
        });

        if (payment) {
          // Confirmer le paiement
          await paymentsService.confirmPayment(payment.id, {
            stripeId: paymentIntent.id
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

// Routes protégées
router.use(requireAuth);

// Créer une intention de paiement Stripe
router.post(
  '/stripe/create-intent',
  paymentsController.createStripePaymentIntent.bind(paymentsController)
);

// Créer un paiement Wave
router.post(
  '/wave/create',
  paymentsController.createWavePayment.bind(paymentsController)
);

// Créer un paiement Orange Money
router.post(
  '/orange-money/create',
  paymentsController.createOrangeMoneyPayment.bind(paymentsController)
);

// Obtenir l'historique des paiements
router.get(
  '/my-payments',
  paymentsController.getMyPayments.bind(paymentsController)
);

export default router;

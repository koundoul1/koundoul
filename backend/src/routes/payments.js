const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../config/database');

const WAVE_API_KEY = process.env.WAVE_API_KEY;
const WAVE_WEBHOOK_SECRET = process.env.WAVE_WEBHOOK_SECRET;
const WAVE_BASE_URL = 'https://api.wave.com/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

// ──────────────────────────────────────────────
// 1. POST /wave/initiate — Initier un paiement Wave
// ──────────────────────────────────────────────
router.post('/wave/initiate', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.userId;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID requis' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan non trouvé' });
    }

    if (plan.price <= 0) {
      return res.status(400).json({ success: false, error: 'Ce plan est gratuit' });
    }

    const clientReference = `${userId}_${planId}_${Date.now()}`;

    // Créer le paiement en DB
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency || 'xof',
        status: 'pending',
        paymentMethod: 'wave',
        metadata: {
          planId,
          planName: plan.name,
          clientReference
        }
      }
    });

    // Appeler l'API Wave Checkout
    try {
      const waveResponse = await axios.post(
        `${WAVE_BASE_URL}/checkout/sessions`,
        {
          amount: String(plan.price),
          currency: 'XOF',
          success_url: `${FRONTEND_URL}/payment/success?ref={CHECKOUT_ID}`,
          error_url: `${FRONTEND_URL}/payment/error`,
          client_reference: clientReference
        },
        {
          headers: {
            'Authorization': `Bearer ${WAVE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mettre à jour le paiement avec l'ID Wave
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          waveCheckoutId: waveResponse.data.id,
          metadata: {
            ...payment.metadata,
            waveCheckoutUrl: waveResponse.data.wave_launch_url
          }
        }
      });

      res.json({
        success: true,
        data: {
          wave_launch_url: waveResponse.data.wave_launch_url,
          checkout_id: waveResponse.data.id
        }
      });
    } catch (waveError) {
      console.error('Erreur Wave API:', waveError.response?.data || waveError.message);

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          metadata: {
            ...payment.metadata,
            errorMessage: waveError.response?.data?.message || waveError.message
          }
        }
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du paiement Wave',
        details: waveError.response?.data || waveError.message
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ──────────────────────────────────────────────
// 2. POST /wave/webhook — Webhook Wave (SANS auth)
// ──────────────────────────────────────────────
router.post('/wave/webhook', async (req, res) => {
  // Répondre 200 immédiatement
  res.status(200).json({ received: true });

  try {
    // Le body est un Buffer grâce à express.raw()
    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
    const signatureHeader = req.headers['wave-signature'];

    // Vérifier la signature si le secret est configuré
    if (WAVE_WEBHOOK_SECRET && signatureHeader) {
      const parts = {};
      signatureHeader.split(',').forEach(part => {
        const [key, value] = part.split('=');
        parts[key] = value;
      });

      const timestamp = parts['t'];
      const signature = parts['v1'];

      if (!timestamp || !signature) {
        console.error('Webhook Wave: signature header invalide');
        return;
      }

      // Rejeter si timestamp > 5 minutes
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(timestamp)) > 300) {
        console.error('Webhook Wave: timestamp trop ancien');
        return;
      }

      // Vérifier HMAC-SHA256
      const payload = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', WAVE_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.error('Webhook Wave: signature invalide');
        return;
      }
    }

    const body = req.body instanceof Buffer ? JSON.parse(rawBody) : req.body;
    const { type, data } = body;

    if (type === 'checkout.session.completed' && data.payment_status === 'succeeded') {
      const clientRef = data.client_reference;

      // Trouver le paiement via client_reference dans metadata
      const payments = await prisma.payment.findMany({
        where: { status: 'pending', paymentMethod: 'wave' }
      });

      const payment = payments.find(p => p.metadata?.clientReference === clientRef);

      if (!payment) {
        console.error('Webhook Wave: paiement non trouvé pour ref:', clientRef);
        return;
      }

      // Mettre à jour le statut du paiement
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          waveCheckoutId: data.id,
          metadata: {
            ...payment.metadata,
            waveTransactionId: data.transaction_id,
            completedAt: new Date().toISOString()
          }
        }
      });

      // Créer l'abonnement
      const planId = payment.metadata?.planId;
      if (planId) {
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        });

        if (plan) {
          // Annuler les abonnements actifs existants
          await prisma.subscription.updateMany({
            where: { userId: payment.userId, status: 'active' },
            data: { status: 'cancelled', cancelledAt: new Date() }
          });

          // Créer le nouvel abonnement
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          const subscription = await prisma.subscription.create({
            data: {
              userId: payment.userId,
              planId: plan.id,
              status: 'active',
              startDate,
              endDate,
              autoRenew: false
            }
          });

          // Lier le paiement à l'abonnement
          await prisma.payment.update({
            where: { id: payment.id },
            data: { subscriptionId: subscription.id }
          });

          console.log(`✅ Abonnement créé pour user ${payment.userId}, plan ${plan.name}, expire le ${endDate.toISOString()}`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur webhook Wave:', error);
  }
});

// ──────────────────────────────────────────────
// 3. GET /wave/status/:checkoutId — Statut checkout Wave
// ──────────────────────────────────────────────
router.get('/wave/status/:checkoutId', authenticateToken, async (req, res) => {
  try {
    const { checkoutId } = req.params;

    // Vérifier en DB d'abord
    const payment = await prisma.payment.findFirst({
      where: { waveCheckoutId: checkoutId },
      include: {
        subscription: { include: { plan: true } }
      }
    });

    if (payment) {
      return res.json({
        success: true,
        data: {
          status: payment.status,
          payment,
          subscription: payment.subscription
        }
      });
    }

    // Sinon appeler l'API Wave
    try {
      const waveResponse = await axios.get(
        `${WAVE_BASE_URL}/checkout/sessions/${checkoutId}`,
        {
          headers: { 'Authorization': `Bearer ${WAVE_API_KEY}` }
        }
      );

      res.json({
        success: true,
        data: {
          status: waveResponse.data.payment_status || waveResponse.data.checkout_status,
          waveData: waveResponse.data
        }
      });
    } catch (waveError) {
      res.status(404).json({
        success: false,
        error: 'Session checkout non trouvée'
      });
    }
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ──────────────────────────────────────────────
// 4. GET /history — Historique paiements de l'user
// ──────────────────────────────────────────────
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      include: {
        subscription: { include: { plan: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ──────────────────────────────────────────────
// LEGACY — Garder l'ancien endpoint pour compatibilité
// ──────────────────────────────────────────────
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      include: {
        subscription: { include: { plan: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Erreur récupération paiements:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Paiement non trouvé' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;

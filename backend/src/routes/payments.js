const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

const { generateInvoice } = require('../utils/invoiceGenerator');

const WAVE_API_KEY = process.env.WAVE_API_KEY;
const WAVE_WEBHOOK_SECRET = process.env.WAVE_WEBHOOK_SECRET;
const WAVE_BASE_URL = 'https://api.wave.com/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

// Orange Money config
const OM_CLIENT_ID = process.env.OM_CLIENT_ID;
const OM_CLIENT_SECRET = process.env.OM_CLIENT_SECRET;
const OM_MERCHANT_KEY = process.env.OM_MERCHANT_KEY;
const OM_BASE_URL = process.env.OM_BASE_URL || 'https://api.orange.com/orange-money-webpay/dev/v1';
const OM_AUTH_URL = 'https://api.orange.com/oauth/v3/token';

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
      let planId = payment.metadata?.planId;
      let plan = null;

      if (planId) {
        plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      }

      // Fallback: try to match plan by payment amount if planId missing or invalid
      if (!plan && payment.amount) {
        plan = await prisma.subscriptionPlan.findFirst({
          where: { price: payment.amount, isActive: true }
        });
        if (plan) {
          console.warn(`[PAYMENT] Missing planId for payment ${payment.id}, matched plan ${plan.name} by amount ${payment.amount}`);
        }
      }

      if (plan) {
        // Annuler les abonnements actifs existants
        await prisma.subscription.updateMany({
          where: { userId: payment.userId, status: { in: ['ACTIVE', 'active'] } },
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
            status: 'ACTIVE',
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

        // Notify user of successful payment
        sendNotification(
          payment.userId,
          'payment_confirmed',
          'Abonnement activé !',
          `Ton abonnement ${plan.name} est maintenant actif. Bon apprentissage !`,
          { planId: plan.id, subscriptionId: subscription.id }
        );

        console.log(`✅ Abonnement créé pour user ${payment.userId}, plan ${plan.name}, expire le ${endDate.toISOString()}`);
      } else if (!plan) {
        console.error(`[PAYMENT] CRITICAL: No plan found for payment ${payment.id} (planId=${planId}, amount=${payment.amount}). User ${payment.userId} paid but got no subscription.`);
        sendNotification(
          payment.userId,
          'payment_issue',
          'Paiement recu - activation en cours',
          'Ton paiement a ete recu mais nous rencontrons un probleme pour activer ton abonnement. Notre equipe va te contacter sous 24h.',
          { paymentId: payment.id }
        );
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

// ──────────────────────────────────────────────
// MANUAL PAYMENT REQUEST (QR Code flow)
// ──────────────────────────────────────────────

router.post('/manual-request', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.userId;

    if (!planId) return res.status(400).json({ success: false, error: 'Plan ID requis' });

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan non trouve' });
    if (plan.price <= 0) return res.status(400).json({ success: false, error: 'Ce plan est gratuit' });

    // Check no pending manual request for same plan
    const existingPending = await prisma.payment.findMany({
      where: { userId, status: 'pending_manual' }
    });
    const existing = existingPending.find(p => p.metadata?.planId === planId);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Tu as deja une demande en attente pour ce plan. Envoie ta confirmation WhatsApp.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phone: true, phoneNumber: true }
    });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency || 'xof',
        status: 'pending_manual',
        paymentMethod: paymentMethod || 'wave',
        metadata: {
          planId,
          planName: plan.displayName || plan.name,
          planDuration: plan.duration,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userEmail: user.email,
          userPhone: user.phone || user.phoneNumber || '',
          requestedAt: new Date().toISOString(),
          type: 'manual_qr'
        }
      }
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: plan.price,
        planName: plan.displayName || plan.name,
        duration: plan.duration
      }
    });
  } catch (error) {
    console.error('Manual payment request error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// User cancels their pending request
router.delete('/manual-request/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user.userId, status: 'pending_manual' }
    });
    if (!payment) return res.status(404).json({ success: false, error: 'Demande non trouvee' });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'cancelled' }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel manual request error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ──────────────────────────────────────────────
// INVOICE / RECEIPT — Generate PDF
// ──────────────────────────────────────────────

router.get('/:id/invoice', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user.userId, status: 'completed' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, username: true, phone: true, phoneNumber: true } },
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Paiement non trouve ou non complete' });
    }

    const pdfBuffer = await generateInvoice(
      payment,
      payment.user,
      payment.subscription,
      payment.subscription?.plan
    );

    const filename = `recu-koundoul-${payment.id.slice(-8).toUpperCase()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, error: 'Erreur generation facture' });
  }
});

// Admin can generate invoice for any payment
router.get('/:id/invoice/admin', async (req, res, next) => {
  try {
    // Import requireAdmin inline to avoid circular
    const { requireAdmin } = require('../middlewares/auth');
    // Manual middleware check
    requireAdmin(req, res, async () => {
      const payment = await prisma.payment.findFirst({
        where: { id: req.params.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, username: true, phone: true, phoneNumber: true } },
          subscription: { include: { plan: true } }
        }
      });

      if (!payment) return res.status(404).json({ success: false, error: 'Paiement non trouve' });

      const pdfBuffer = await generateInvoice(payment, payment.user, payment.subscription, payment.subscription?.plan);
      const filename = `recu-koundoul-${payment.id.slice(-8).toUpperCase()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    });
  } catch (error) {
    console.error('Admin invoice error:', error);
    res.status(500).json({ success: false, error: 'Erreur generation facture' });
  }
});

// ──────────────────────────────────────────────
// ORANGE MONEY — Initier un paiement
// ──────────────────────────────────────────────

async function getOmAccessToken() {
  const response = await axios.post(OM_AUTH_URL,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${OM_CLIENT_ID}:${OM_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
}

router.post('/om/initiate', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.userId;

    if (!planId) return res.status(400).json({ success: false, error: 'Plan ID requis' });
    if (!OM_CLIENT_ID || !OM_CLIENT_SECRET) {
      return res.status(503).json({ success: false, error: 'Orange Money non configuré' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan non trouvé' });
    if (plan.price <= 0) return res.status(400).json({ success: false, error: 'Ce plan est gratuit' });

    const orderId = `KDL_${userId.slice(-6)}_${Date.now()}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency || 'xof',
        status: 'pending',
        paymentMethod: 'orange_money',
        metadata: { planId, planName: plan.name, orderId }
      }
    });

    try {
      const accessToken = await getOmAccessToken();

      const omResponse = await axios.post(
        `${OM_BASE_URL}/webpayment`,
        {
          merchant_key: OM_MERCHANT_KEY,
          currency: 'OUV',
          order_id: orderId,
          amount: plan.price,
          return_url: `${FRONTEND_URL}/payment/success?method=om&ref=${payment.id}`,
          cancel_url: `${FRONTEND_URL}/payment/error?method=om`,
          notif_url: `${process.env.BACKEND_URL || 'https://koundoul-backend.onrender.com'}/api/payments/om/webhook`,
          lang: 'fr',
          reference: payment.id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const payToken = omResponse.data.pay_token;
      const paymentUrl = omResponse.data.payment_url;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          orange_money_id: payToken,
          metadata: { ...payment.metadata, payToken, paymentUrl }
        }
      });

      res.json({
        success: true,
        data: {
          payment_url: paymentUrl,
          pay_token: payToken,
          payment_id: payment.id
        }
      });
    } catch (omError) {
      console.error('Erreur Orange Money API:', omError.response?.data || omError.message);
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          metadata: { ...payment.metadata, errorMessage: omError.response?.data?.message || omError.message }
        }
      });
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du paiement Orange Money',
        details: omError.response?.data || omError.message
      });
    }
  } catch (error) {
    console.error('Erreur paiement OM:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ──────────────────────────────────────────────
// ORANGE MONEY — Webhook (notif_url callback)
// ──────────────────────────────────────────────

router.post('/om/webhook', async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const { status, pay_token, txnid } = req.body;

    if (status !== 'SUCCESS') {
      console.log('[OM Webhook] Non-success status:', status);
      return;
    }

    // Find payment by pay_token (stored as orange_money_id)
    const payment = await prisma.payment.findFirst({
      where: { orange_money_id: pay_token, status: 'pending' }
    });

    if (!payment) {
      console.error('[OM Webhook] Payment not found for pay_token:', pay_token);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        metadata: { ...payment.metadata, omTransactionId: txnid, completedAt: new Date().toISOString() }
      }
    });

    // Create subscription (same logic as Wave)
    let planId = payment.metadata?.planId;
    let plan = null;

    if (planId) {
      plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    }

    if (!plan && payment.amount) {
      plan = await prisma.subscriptionPlan.findFirst({
        where: { price: payment.amount, isActive: true }
      });
      if (plan) {
        console.warn(`[OM] Missing planId for payment ${payment.id}, matched plan ${plan.name} by amount ${payment.amount}`);
      }
    }

    if (plan) {
      await prisma.subscription.updateMany({
        where: { userId: payment.userId, status: { in: ['ACTIVE', 'active'] } },
        data: { status: 'cancelled', cancelledAt: new Date() }
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      const subscription = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          autoRenew: false
        }
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { subscriptionId: subscription.id }
      });

      sendNotification(
        payment.userId,
        'payment_confirmed',
        'Abonnement activé via Orange Money !',
        `Ton abonnement ${plan.displayName || plan.name} est actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}.`,
        { planId: plan.id, subscriptionId: subscription.id }
      );

      console.log(`✅ [OM] Abonnement créé pour user ${payment.userId}, plan ${plan.name}`);
    } else {
      console.error(`[OM] CRITICAL: No plan found for payment ${payment.id} (planId=${planId}, amount=${payment.amount}). User ${payment.userId} paid but got no subscription.`);
      sendNotification(
        payment.userId,
        'payment_issue',
        'Paiement recu - activation en cours',
        'Ton paiement Orange Money a ete recu mais nous rencontrons un probleme pour activer ton abonnement. Notre equipe va te contacter sous 24h.',
        { paymentId: payment.id }
      );
    }
  } catch (error) {
    console.error('Erreur webhook Orange Money:', error);
  }
});

// ──────────────────────────────────────────────
// ORANGE MONEY — Vérifier statut paiement
// ──────────────────────────────────────────────

router.get('/om/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.paymentId, userId: req.user.userId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!payment) return res.status(404).json({ success: false, error: 'Paiement non trouvé' });

    // If still pending, check with OM API
    if (payment.status === 'pending' && payment.orange_money_id) {
      try {
        const accessToken = await getOmAccessToken();
        const omStatus = await axios.get(
          `${OM_BASE_URL}/webpayment/${payment.orange_money_id}`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (omStatus.data.status === 'SUCCESS' || omStatus.data.status === 'SUCCESSFULL') {
          // Trigger same logic as webhook
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'completed', metadata: { ...payment.metadata, completedAt: new Date().toISOString() } }
          });

          let planId = payment.metadata?.planId;
          let plan = null;
          if (planId) {
            plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
          }
          if (!plan && payment.amount) {
            plan = await prisma.subscriptionPlan.findFirst({ where: { price: payment.amount, isActive: true } });
            if (plan) console.warn(`[OM-STATUS] Matched plan ${plan.name} by amount for payment ${payment.id}`);
          }
          if (plan) {
            await prisma.subscription.updateMany({
              where: { userId: payment.userId, status: { in: ['ACTIVE', 'active'] } },
              data: { status: 'cancelled', cancelledAt: new Date() }
            });
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration);
            const subscription = await prisma.subscription.create({
              data: { userId: payment.userId, planId: plan.id, status: 'ACTIVE', startDate, endDate, autoRenew: false }
            });
            await prisma.payment.update({ where: { id: payment.id }, data: { subscriptionId: subscription.id } });
          } else {
            console.error(`[OM-STATUS] No plan found for payment ${payment.id}. User ${payment.userId} paid without subscription.`);
          }

          const updated = await prisma.payment.findFirst({
            where: { id: payment.id },
            include: { subscription: { include: { plan: true } } }
          });
          return res.json({ success: true, data: { status: 'completed', payment: updated, subscription: updated?.subscription } });
        }
      } catch (omErr) {
        console.error('OM status check error:', omErr.message);
      }
    }

    res.json({ success: true, data: { status: payment.status, payment, subscription: payment.subscription } });
  } catch (error) {
    console.error('Erreur vérification statut OM:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const axios = require('axios');
const prisma = require('../config/database');
const WAVE_API_KEY = process.env.WAVE_API_KEY;
const WAVE_BASE_URL = 'https://api.wave.com/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Créer un paiement Wave
router.post('/wave/create', authenticateToken, async (req, res) => {
  try {
    const { planId, amount, currency = 'XOF' } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID requis'
      });
    }

    // Récupérer le plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan non trouvé'
      });
    }

    const paymentAmount = amount || plan.price;
    const paymentCurrency = currency || plan.currency;

    // Créer le paiement en base de données
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.userId,
        amount: paymentAmount,
        currency: paymentCurrency,
        status: 'pending',
        paymentMethod: 'wave',
        metadata: {
          planId: planId,
          planName: plan.name
        }
      }
    });

    // Créer la session Wave Checkout
    try {
      const waveResponse = await axios.post(
        `${WAVE_BASE_URL}/checkout/sessions`,
        {
          amount: paymentAmount.toString(),
          currency: paymentCurrency,
          error_url: `${FRONTEND_URL}/subscriptions?payment=error&paymentId=${payment.id}`,
          success_url: `${FRONTEND_URL}/subscriptions?payment=success&paymentId=${payment.id}`
        },
        {
          headers: {
            'Authorization': `Bearer ${WAVE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mettre à jour le paiement avec l'ID Wave
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          waveCheckoutId: waveResponse.data.id,
          metadata: {
            ...payment.metadata,
            waveCheckoutUrl: waveResponse.data.checkout_url
          }
        }
      });

      res.json({
        success: true,
        data: {
          payment: updatedPayment,
          checkoutUrl: waveResponse.data.checkout_url,
          checkoutId: waveResponse.data.id
        }
      });
    } catch (waveError) {
      console.error('Erreur Wave API:', waveError.response?.data || waveError.message);
      
      // Marquer le paiement comme échoué
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
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du paiement'
    });
  }
});

// Webhook Wave pour confirmer les paiements
router.post('/wave/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    // Vérifier l'authenticité du webhook (à implémenter avec signature Wave)
    if (event === 'checkout.session.completed') {
      const checkoutId = data.id;
      const transactionId = data.transaction_id;

      // Trouver le paiement correspondant
      const payment = await prisma.payment.findFirst({
        where: { waveCheckoutId: checkoutId }
      });

      if (payment && payment.status === 'pending') {
        // Mettre à jour le paiement
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            metadata: {
              ...payment.metadata,
              waveTransactionId: transactionId,
              completedAt: new Date().toISOString()
            }
          }
        });

        // Créer ou renouveler l'abonnement
        if (payment.metadata?.planId) {
          const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: payment.metadata.planId }
          });

          if (plan) {
            // Annuler l'abonnement actuel
            await prisma.subscription.updateMany({
              where: {
                userId: payment.userId,
                status: 'active'
              },
              data: {
                status: 'cancelled',
                cancelledAt: new Date()
              }
            });

            // Calculer la date de fin
            const startDate = new Date();
            const endDate = new Date();
            
            if (plan.interval === 'monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.interval === 'yearly') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            // Créer le nouvel abonnement
            await prisma.subscription.create({
              data: {
                userId: payment.userId,
                planId: plan.id,
                status: 'active',
                startDate,
                endDate,
                autoRenew: true
              }
            });

            // Lier le paiement à l'abonnement
            const subscription = await prisma.subscription.findFirst({
              where: {
                userId: payment.userId,
                status: 'active'
              }
            });

            if (subscription) {
              await prisma.payment.update({
                where: { id: payment.id },
                data: { subscriptionId: subscription.id }
              });
            }
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Wave:', error);
    res.status(500).json({ error: 'Erreur webhook' });
  }
});

// Vérifier le statut d'un paiement
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Paiement non trouvé'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

// Obtenir l'historique des paiements de l'utilisateur
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des paiements'
    });
  }
});

module.exports = router;


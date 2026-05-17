const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// Obtenir tous les plans disponibles
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des plans:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des plans'
    });
  }
});

// Obtenir l'abonnement actuel de l'utilisateur
router.get('/my-subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.userId,
        status: { in: ['ACTIVE', 'active'] }
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'abonnement'
    });
  }
});

// Obtenir l'historique des abonnements
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.userId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

// Créer un nouvel abonnement (après paiement)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID requis'
      });
    }

    // Vérifier que le plan existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Plan non trouvé ou inactif'
      });
    }

    // Annuler l'abonnement actuel s'il existe
    await prisma.subscription.updateMany({
      where: {
        userId: req.user.userId,
        status: { in: ['ACTIVE', 'active'] }
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Calculer la date de fin
    const startDate = new Date();
    const endDate = new Date();

    if (plan.interval === 'daily') {
      endDate.setDate(endDate.getDate() + 1);
    } else if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      console.error(`[SUB] Unknown plan interval: ${plan.interval} for plan ${plan.id}, using 30d fallback`);
      endDate.setDate(endDate.getDate() + 30);
    }

    // Créer le nouvel abonnement
    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.userId,
        planId: planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: true
      },
      include: {
        plan: true
      }
    });

    // Lier le paiement si fourni
    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { subscriptionId: subscription.id }
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'abonnement'
    });
  }
});

// Annuler un abonnement
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé'
      });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        autoRenew: false
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'annulation'
    });
  }
});

module.exports = router;


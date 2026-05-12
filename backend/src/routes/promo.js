var express = require('express');
var router = express.Router();
var { authenticateToken } = require('../middlewares/auth');
var { requireAdmin } = require('../middlewares/auth');
var prisma = require('../config/database');

// ── POST /validate — student enters promo code ──────────────────────

router.post('/validate', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;
    var code = (req.body.code || '').trim().toUpperCase();

    if (!code) return res.status(400).json({ error: 'Code promo requis' });

    var promo = await prisma.promoCode.findUnique({ where: { code: code } });

    if (!promo) return res.status(404).json({ error: 'Code promo invalide' });
    if (!promo.isActive) return res.status(400).json({ error: 'Ce code promo n\'est plus actif' });
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) return res.status(400).json({ error: 'Ce code promo a expire' });
    if (promo.currentUses >= promo.maxUses) return res.status(400).json({ error: 'Ce code promo a atteint sa limite d\'utilisation' });

    // Check if user already used this code
    var alreadyUsed = await prisma.promoCodeUse.findFirst({
      where: { promoCodeId: promo.id, userId: userId }
    });
    if (alreadyUsed) return res.status(400).json({ error: 'Tu as deja utilise ce code promo' });

    // Deactivate existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: userId, status: 'ACTIVE' },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });

    // Create subscription with promo plan
    var now = new Date();
    var endDate = new Date(now);
    endDate.setDate(endDate.getDate() + promo.durationDays);

    var subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        planId: promo.planId,
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
        autoRenew: false
      },
      include: { plan: true }
    });

    // Record usage
    await prisma.promoCodeUse.create({
      data: { promoCodeId: promo.id, userId: userId }
    });

    // Increment usage counter
    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { currentUses: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Code promo applique ! Plan ' + (subscription.plan.displayName || subscription.plan.name) + ' actif pour ' + promo.durationDays + ' jours.',
      data: {
        plan: subscription.plan.displayName || subscription.plan.name,
        endDate: endDate
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: CRUD promo codes ─────────────────────────────────────────

router.get('/admin/list', requireAdmin, async function(req, res, next) {
  try {
    var promos = await prisma.promoCode.findMany({
      include: {
        plan: { select: { name: true, displayName: true } },
        uses: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          orderBy: { usedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: promos });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/create', requireAdmin, async function(req, res, next) {
  try {
    var code = (req.body.code || '').trim().toUpperCase();
    var planId = req.body.planId;
    var durationDays = req.body.durationDays || 30;
    var maxUses = req.body.maxUses || 100;
    var description = req.body.description || '';
    var expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;

    if (!code || !planId) return res.status(400).json({ error: 'Code et planId requis' });

    var existing = await prisma.promoCode.findUnique({ where: { code: code } });
    if (existing) return res.status(400).json({ error: 'Ce code existe deja' });

    var promo = await prisma.promoCode.create({
      data: { code: code, planId: planId, durationDays: durationDays, maxUses: maxUses, description: description, expiresAt: expiresAt }
    });

    res.status(201).json({ success: true, data: promo });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/:id', requireAdmin, async function(req, res, next) {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, username } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(username !== undefined && { username })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = {
      xp: 0,
      level: 1,
      exercisesCompleted: 0,
      badgesUnlocked: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


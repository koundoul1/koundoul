const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Analyze exercise
router.post('/analyze', authenticateToken, async (req, res, next) => {
  try {
    const { imageData, text } = req.body;
    const userId = req.user.userId;

    if (!imageData && !text) {
      return res.status(400).json({ error: 'Image ou texte requis' });
    }

    // Placeholder pour l'analyse IA
    // Ici vous intégrerez votre service de vision/OCR + IA
    const analysis = {
      equation: text || 'Équation détectée depuis l\'image',
      steps: [],
      guidance: 'beginner',
      detectedType: 'equation'
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Start step session
router.post('/steps/start', authenticateToken, async (req, res, next) => {
  try {
    const { equation, guidanceLevel = 'beginner' } = req.body;
    const userId = req.user.userId;

    if (!equation) {
      return res.status(400).json({ error: 'Équation requise' });
    }

    const session = await prisma.coachSession.create({
      data: {
        userId,
        equation,
        guidanceLevel,
        steps: [],
        currentStep: 0,
        completed: false
      }
    });

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// Validate step answer
router.post('/steps/validate', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, inputs } = req.body;
    const userId = req.user.userId;

    const session = await prisma.coachSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    if (session.completed) {
      return res.status(400).json({ error: 'Session déjà complétée' });
    }

    // Placeholder - valider avec IA
    const isValid = true; // À implémenter avec IA
    const feedback = 'Bonne réponse !';

    // Mettre à jour la session
    const updated = await prisma.coachSession.update({
      where: { id: sessionId },
      data: {
        currentStep: session.currentStep + 1,
        steps: [...(session.steps || []), { step: session.currentStep + 1, inputs, isValid, feedback }]
      }
    });

    res.json({ success: true, data: { isValid, feedback, session: updated } });
  } catch (error) {
    next(error);
  }
});

// Get step hint
router.post('/steps/hint', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, level } = req.body;
    const userId = req.user.userId;

    const session = await prisma.coachSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Placeholder - générer indice avec IA
    const hint = 'Indice généré par l\'IA selon le niveau';

    res.json({ success: true, data: { hint } });
  } catch (error) {
    next(error);
  }
});

// Complete step session
router.post('/steps/complete', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    const session = await prisma.coachSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Calculer le score
    const totalSteps = session.steps?.length || 0;
    const correctSteps = session.steps?.filter(s => s.isValid).length || 0;
    const score = totalSteps > 0 ? (correctSteps / totalSteps) * 100 : 0;

    const updated = await prisma.coachSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        score,
        completedAt: new Date()
      }
    });

    // Ajouter XP
    const xpEarned = Math.round(score / 10); // 1 XP par 10% de score
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpEarned } }
    });

    res.json({
      success: true,
      data: {
        ...updated,
        xpEarned
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get session history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const sessions = await prisma.coachSession.findMany({
      where: { userId, completed: true },
      orderBy: { completedAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

// Get coach stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalSessions, avgScore] = await Promise.all([
      prisma.coachSession.count({
        where: { userId, completed: true }
      }),
      prisma.coachSession.aggregate({
        where: { userId, completed: true, score: { not: null } },
        _avg: { score: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalSessions,
        averageScore: avgScore._avg.score ? Math.round(avgScore._avg.score) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

/**
 * 🤖 Coach Virtuel Controller - KOUNDOUL
 * Contrôleur pour les fonctionnalités du coach virtuel
 */

import coachService from './coach.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CoachController {
  /**
   * Analyse une image d'exercice
   */
  async analyzeExercise(req, res) {
    try {
      const { imageData, text } = req.body;
      
      if (!imageData && !text) {
        return res.status(400).json({
          success: false,
          message: 'Aucune donnée fournie (image ou texte)'
        });
      }

      // Log pour debug
      console.log('📝 Coach analyze - Mode:', imageData ? 'image' : 'text', 'Taille:', imageData ? imageData.length : text?.length);

      let analysis;
      try {
        analysis = imageData
          ? await coachService.analyzeExercise(imageData)
          : await coachService.analyzeText(text);
        
        if (!analysis.success) {
          return res.status(500).json(analysis);
        }
      } catch (error) {
        console.error('❌ Erreur analyse (IA uniquement):', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur lors de l\'analyse avec Gemini IA',
          error: error.message
        });
      }

      // Sauvegarder la session dans la base de données (utilisateur optionnel)
      const sessionData = {
        exerciseAnalysis: analysis.data,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        ...(req.user?.id && { userId: req.user.id })
      };

      let sessionId;
      try {
        const session = await prisma.coachSession.create({ data: sessionData });
        sessionId = session.id;
      } catch (dbError) {
        console.warn('⚠️ CoachSession create failed, fallback to guest session:', dbError.message);
        sessionId = `guest-${Date.now()}`;
      }

      res.json({
        success: true,
        data: {
          ...analysis.data,
          sessionId
        }
      });

    } catch (error) {
      console.error('❌ Erreur analyse exercice (IA uniquement):', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'analyse avec Gemini IA',
        error: error.message
      });
    }
  }

  /**
   * Génère la question suivante
   */
  async generateNextQuestion(req, res) {
    try {
      const { sessionId, userAnswers, currentStep } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'ID de session manquant'
        });
      }

      // Récupérer la session
      const session = await prisma.coachSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session non trouvée'
        });
      }

      const question = await coachService.generateNextQuestion(
        session.exerciseAnalysis,
        userAnswers,
        currentStep
      );

      if (!question.success) {
        return res.status(500).json(question);
      }

      res.json({
        success: true,
        data: question.data
      });

    } catch (error) {
      console.error('Erreur génération question:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération de la question',
        error: error.message
      });
    }
  }

  /**
   * Valide une réponse d'élève
   */
  async validateAnswer(req, res) {
    try {
      const { sessionId, question, userAnswer, helpLevel } = req.body;
      
      let validation;
      try {
        validation = await coachService.validateAnswer(question, userAnswer, helpLevel);
        
        if (!validation.success) {
          return res.status(500).json(validation);
        }
      } catch (error) {
        console.error('❌ Erreur validation (IA uniquement):', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur lors de la validation avec Gemini IA',
          error: error.message
        });
      }

      // Sauvegarder la réponse
      await prisma.coachAnswer.create({
        data: {
          sessionId,
          question: JSON.stringify(question),
          userAnswer,
          helpLevel,
          isCorrect: validation.data.isCorrect,
          feedback: validation.data.feedback,
          points: validation.data.points
        }
      });

      res.json({
        success: true,
        data: validation.data
      });

    } catch (error) {
      console.error('Erreur validation réponse:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation de la réponse',
        error: error.message
      });
    }
  }

  /**
   * Termine une session et génère le résumé
   */
  async completeSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      // Récupérer la session et toutes les réponses
      const session = await prisma.coachSession.findUnique({
        where: { id: sessionId },
        include: {
          answers: true
        }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session non trouvée'
        });
      }

      // Calculer le temps total
      const totalTime = Math.round((new Date() - session.startedAt) / 60000); // en minutes

      // Générer le résumé
      const summary = await coachService.generateSessionSummary(
        session.exerciseAnalysis,
        session.answers,
        totalTime
      );

      if (!summary.success) {
        return res.status(500).json(summary);
      }

      // Mettre à jour la session
      await prisma.coachSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          totalTime,
          summary: summary.data,
          score: summary.data.overallScore,
          xpEarned: summary.data.xpEarned
        }
      });

      // Ajouter les XP à l'utilisateur
      if (req.user?.id) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            xp: {
              increment: summary.data.xpEarned
            }
          }
        });
      }

      res.json({
        success: true,
        data: summary.data
      });

    } catch (error) {
      console.error('Erreur completion session:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la finalisation de la session',
        error: error.message
      });
    }
  }

  /**
   * Récupère l'historique des sessions du coach
   */
  async getSessionHistory(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const sessions = await prisma.coachSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          exerciseAnalysis: true,
          status: true,
          startedAt: true,
          completedAt: true,
          totalTime: true,
          score: true,
          xpEarned: true,
          summary: true,
          answers: {
            select: {
              id: true,
              isCorrect: true,
              points: true,
              helpLevel: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Erreur récupération historique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
        error: error.message
      });
    }
  }

  /**
   * Récupère les statistiques du coach
   */
  async getCoachStats(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const stats = await prisma.coachSession.aggregate({
        where: { userId },
        _count: {
          id: true
        },
        _avg: {
          score: true,
          totalTime: true,
          xpEarned: true
        },
        _sum: {
          xpEarned: true
        }
      });

      const completedSessions = await prisma.coachSession.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      });

      const totalAnswers = await prisma.coachAnswer.count({
        where: {
          session: {
            userId
          }
        }
      });

      const correctAnswers = await prisma.coachAnswer.count({
        where: {
          session: {
            userId
          },
          isCorrect: true
        }
      });

      res.json({
        success: true,
        data: {
          totalSessions: stats._count.id,
          completedSessions,
          averageScore: stats._avg.score || 0,
          averageTime: stats._avg.totalTime || 0,
          totalXP: stats._sum.xpEarned || 0,
          totalAnswers,
          correctAnswers,
          accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(1) : 0
        }
      });

    } catch (error) {
      console.error('Erreur récupération stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  /**
   * Démarre une session de résolution par étapes
   */
  async startStepSession(req, res) {
    try {
      const { equation, guidanceLevel } = req.body;
      
      if (!equation) {
        return res.status(400).json({
          success: false,
          message: 'Équation manquante'
        });
      }

      const result = await coachService.startStepSession(equation, guidanceLevel);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erreur startStepSession:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du démarrage de la session',
        error: error.message
      });
    }
  }

  /**
   * Valide une réponse pour l'étape courante
   */
  async validateStepAnswer(req, res) {
    try {
      const { sessionId, inputs } = req.body;
      
      if (!sessionId || !inputs) {
        return res.status(400).json({
          success: false,
          message: 'SessionId et inputs manquants'
        });
      }

      const result = await coachService.validateStepAnswer(sessionId, inputs);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erreur validateStepAnswer:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation',
        error: error.message
      });
    }
  }

  /**
   * Récupère un indice pour l'étape courante
   */
  async getStepHint(req, res) {
    try {
      const { sessionId, level } = req.body;
      
      if (!sessionId || level === undefined) {
        return res.status(400).json({
          success: false,
          message: 'SessionId et level manquants'
        });
      }

      const result = await coachService.getStepHint(sessionId, level);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erreur getStepHint:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'indice',
        error: error.message
      });
    }
  }

  /**
   * Adapte le niveau de guidage
   */
  async adaptGuidance(req, res) {
    try {
      const { sessionId, trigger } = req.body;
      
      if (!sessionId || !trigger) {
        return res.status(400).json({
          success: false,
          message: 'SessionId et trigger manquants'
        });
      }

      const result = await coachService.adaptGuidance(sessionId, trigger);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erreur adaptGuidance:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'adaptation du guidage',
        error: error.message
      });
    }
  }

  /**
   * Termine une session de résolution
   */
  async completeStepSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'SessionId manquant'
        });
      }

      const result = await coachService.completeStepSession(sessionId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Erreur completeStepSession:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la finalisation de la session',
        error: error.message
      });
    }
  }
}

export default new CoachController();

/**
 * 👤 Controller User - Koundoul
 * Gestion du profil utilisateur et des statistiques
 */

import prismaService from '../../database/prisma.js';

/**
 * Obtenir les statistiques complètes de l'utilisateur
 * GET /api/user/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les données utilisateur avec toutes les relations nécessaires
    const user = await prismaService.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Date il y a 7 jours pour statistiques hebdomadaires
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Calculer toutes les statistiques en parallèle pour optimiser
    const [
      problemsCount,
      problemsThisWeek,
      quizzesCompleted,
      quizzesCompletedThisWeek,
      quizAverageScore,
      badgesEarned,
      badgesThisWeek,
      lessonsCompleted,
      lessonsCompletedThisWeek,
      exerciseAttempts,
      exerciseAttemptsThisWeek,
      flashcardsReviewed,
      coachSessionsCount,
      discussionsCount,
      repliesCount
    ] = await Promise.all([
      // Problèmes résolus
      prismaService.client.problem.count({
        where: { userId: userId }
      }),
      prismaService.client.problem.count({
        where: { 
          userId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      // Quiz complétés
      prismaService.client.quizAttempt.count({
        where: {
          userId: userId,
          status: 'COMPLETED'
        }
      }),
      prismaService.client.quizAttempt.count({
        where: {
          userId: userId,
          status: 'COMPLETED',
          completedAt: { gte: sevenDaysAgo }
        }
      }),
      // Score moyen quiz
      prismaService.client.quizAttempt.aggregate({
        where: {
          userId: userId,
          status: 'COMPLETED'
        },
        _avg: { score: true }
      }).then(result => Math.round(result._avg.score || 0)),
      // Badges
      prismaService.client.userBadge.count({
        where: { userId: userId }
      }),
      prismaService.client.userBadge.count({
        where: { 
          userId: userId,
          earnedAt: { gte: sevenDaysAgo }
        }
      }),
      // Leçons complétées
      prismaService.client.lessonCompletion.count({
        where: { 
          userId: userId,
          completed: true
        }
      }),
      prismaService.client.lessonCompletion.count({
        where: { 
          userId: userId,
          completed: true,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      // Tentatives d'exercices
      prismaService.client.exerciseAttempt.count({
        where: { userId: userId }
      }),
      prismaService.client.exerciseAttempt.count({
        where: { 
          userId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      // Flashcards révisées
      prismaService.client.flashcardReview.count({
        where: { userId: userId }
      }),
      // Sessions coach
      prismaService.client.coachSession.count({
        where: { userId: userId }
      }),
      // Discussions créées
      prismaService.client.discussion.count({
        where: { userId: userId }
      }),
      // Réponses dans le forum
      prismaService.client.reply.count({
        where: { userId: userId }
      })
    ]);
    
    // Jours actifs (jours avec activité)
    const activities = await prismaService.client.problem.findMany({
      where: {
        userId: userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true }
    });
    
    const uniqueDays = new Set(
      activities.map(a => new Date(a.createdAt).toDateString())
    );
    const daysActiveLast30Days = uniqueDays.size;
    
    // Calculer le temps d'étude estimé (en minutes)
    const estimatedStudyTimeMinutes = 
      (problemsCount * 10) + // 10 min par problème
      (quizzesCompleted * 15) + // 15 min par quiz
      (lessonsCompleted * 20) + // 20 min par leçon
      (exerciseAttempts * 8); // 8 min par exercice
    
    // Calculer le temps d'étude de la semaine
    const estimatedStudyTimeThisWeekMinutes =
      (problemsThisWeek * 10) +
      (quizzesCompletedThisWeek * 15) +
      (lessonsCompletedThisWeek * 20) +
      (exerciseAttemptsThisWeek * 8);
    
    // Progression par matière (basée sur les problèmes)
    const problemsBySubject = await prismaService.client.problem.groupBy({
      by: ['subject'],
      where: { userId: userId },
      _count: { id: true }
    });
    
    const subjectsProgress = problemsBySubject.map(p => ({
      subject: p.subject,
      count: p._count.id,
      progress: Math.min(Math.round((p._count.id / 50) * 100), 100) // Max 100%
    }));
    
    // Stats complètes
    const stats = {
      // Stats de base
      totalXp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      
      // Jours depuis inscription
      daysSinceJoined: Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
      daysActiveLast30Days,
      
      // Activités
      problemsSolved: problemsCount,
      problemsThisWeek,
      quizzesCompleted,
      quizzesCompletedThisWeek,
      quizAverageScore,
      badgesEarned,
      badgesThisWeek,
      lessonsCompleted,
      lessonsCompletedThisWeek,
      exerciseAttempts,
      exerciseAttemptsThisWeek,
      flashcardsReviewed,
      coachSessionsCount,
      discussionsCount,
      repliesCount,
      
      // Temps d'étude
      estimatedStudyTimeMinutes,
      estimatedStudyTimeHours: Math.round(estimatedStudyTimeMinutes / 60 * 10) / 10,
      estimatedStudyTimeThisWeekMinutes,
      estimatedStudyTimeThisWeekHours: Math.round(estimatedStudyTimeThisWeekMinutes / 60 * 10) / 10,
      
      // Progression par matière
      subjectsProgress,
      
      // Stats supplémentaires
      totalActivities: problemsCount + quizzesCompleted + lessonsCompleted + exerciseAttempts,
      activitiesThisWeek: problemsThisWeek + quizzesCompletedThisWeek + lessonsCompletedThisWeek + exerciseAttemptsThisWeek
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Générer ou régénérer un code d'invitation pour connexion parent
 * POST /api/user/generate-invitation-code
 */
export const generateInvitationCode = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Générer code unique (6 caractères alphanumériques)
    let code;
    let attempts = 0;
    let isUnique = false;
    
    // Vérifier l'unicité du code (avec limite de tentatives pour éviter boucle infinie)
    while (!isUnique && attempts < 10) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const existing = await prismaService.client.user.findUnique({
        where: { invitationCode: code }
      });
      
      if (!existing || existing.id === userId) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du code (trop de tentatives)'
      });
    }
    
    // Mettre à jour l'utilisateur
    await prismaService.client.user.update({
      where: { id: userId },
      data: { invitationCode: code }
    });
    
    res.json({
      success: true,
      data: { 
        code,
        message: 'Code d\'invitation généré avec succès. Partagez-le avec vos parents pour qu\'ils puissent suivre votre progression.'
      }
    });
    
  } catch (error) {
    console.error('❌ Generate code error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du code'
    });
  }
};

/**
 * Obtenir le profil utilisateur
 * GET /api/user/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prismaService.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        invitationCode: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

export default {
  getUserStats,
  generateInvitationCode,
  getProfile
};










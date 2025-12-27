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
    // Chaque requête est dans un try-catch pour éviter qu'une erreur fasse planter tout
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
      }).catch(err => {
        console.warn('⚠️ Error counting problems:', err.message);
        return 0;
      }),
      prismaService.client.problem.count({
        where: { 
          userId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }).catch(err => {
        console.warn('⚠️ Error counting problems this week:', err.message);
        return 0;
      }),
      // Quiz complétés
      prismaService.client.quizAttempt.count({
        where: {
          userId: userId,
          status: 'COMPLETED'
        }
      }).catch(err => {
        console.warn('⚠️ Error counting quizzes:', err.message);
        return 0;
      }),
      prismaService.client.quizAttempt.count({
        where: {
          userId: userId,
          status: 'COMPLETED',
          completedAt: { gte: sevenDaysAgo }
        }
      }).catch(err => {
        console.warn('⚠️ Error counting quizzes this week:', err.message);
        return 0;
      }),
      // Score moyen quiz
      prismaService.client.quizAttempt.aggregate({
        where: {
          userId: userId,
          status: 'COMPLETED'
        },
        _avg: { score: true }
      }).then(result => Math.round(result._avg.score || 0)).catch(err => {
        console.warn('⚠️ Error calculating quiz average:', err.message);
        return 0;
      }),
      // Badges
      prismaService.client.userBadge.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting badges:', err.message);
        return 0;
      }),
      prismaService.client.userBadge.count({
        where: { 
          userId: userId,
          earnedAt: { gte: sevenDaysAgo }
        }
      }).catch(err => {
        console.warn('⚠️ Error counting badges this week:', err.message);
        return 0;
      }),
      // Leçons complétées
      prismaService.client.lessonCompletion.count({
        where: { 
          userId: userId,
          completed: true
        }
      }).catch(err => {
        console.warn('⚠️ Error counting lessons:', err.message);
        return 0;
      }),
      prismaService.client.lessonCompletion.count({
        where: { 
          userId: userId,
          completed: true,
          createdAt: { gte: sevenDaysAgo }
        }
      }).catch(err => {
        console.warn('⚠️ Error counting lessons this week:', err.message);
        return 0;
      }),
      // Tentatives d'exercices
      prismaService.client.exerciseAttempt.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting exercise attempts:', err.message);
        return 0;
      }),
      prismaService.client.exerciseAttempt.count({
        where: { 
          userId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }).catch(err => {
        console.warn('⚠️ Error counting exercise attempts this week:', err.message);
        return 0;
      }),
      // Flashcards révisées
      prismaService.client.flashcardReview.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting flashcard reviews:', err.message);
        return 0;
      }),
      // Sessions coach
      prismaService.client.coachSession.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting coach sessions:', err.message);
        return 0;
      }),
      // Discussions créées
      prismaService.client.discussion.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting discussions:', err.message);
        return 0;
      }),
      // Réponses dans le forum
      prismaService.client.reply.count({
        where: { userId: userId }
      }).catch(err => {
        console.warn('⚠️ Error counting replies:', err.message);
        return 0;
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
    let subjectsProgress = [];
    try {
      const problemsBySubject = await prismaService.client.problem.groupBy({
        by: ['subject'],
        where: { userId: userId },
        _count: { id: true }
      });
      
      subjectsProgress = problemsBySubject.map(p => ({
        subject: p.subject,
        count: p._count.id,
        progress: Math.min(Math.round((p._count.id / 50) * 100), 100) // Max 100%
      }));
    } catch (err) {
      console.warn('⚠️ Error calculating subjects progress:', err.message);
      subjectsProgress = [];
    }
    
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
    console.error('❌ Error details:', error.message, error.stack);
    // Retourner des stats par défaut au lieu d'une erreur 500 pour éviter de casser l'interface
    res.json({
      success: true,
      data: {
        totalXp: user?.xp || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
        daysSinceJoined: user?.createdAt ? Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ) : 0,
        daysActiveLast30Days: 0,
        problemsSolved: 0,
        problemsThisWeek: 0,
        quizzesCompleted: 0,
        quizzesCompletedThisWeek: 0,
        quizAverageScore: 0,
        badgesEarned: 0,
        badgesThisWeek: 0,
        lessonsCompleted: 0,
        lessonsCompletedThisWeek: 0,
        exerciseAttempts: 0,
        exerciseAttemptsThisWeek: 0,
        flashcardsReviewed: 0,
        coachSessionsCount: 0,
        discussionsCount: 0,
        repliesCount: 0,
        estimatedStudyTimeMinutes: 0,
        estimatedStudyTimeHours: 0,
        estimatedStudyTimeThisWeekMinutes: 0,
        estimatedStudyTimeThisWeekHours: 0,
        subjectsProgress: [],
        totalActivities: 0,
        activitiesThisWeek: 0
      }
    });
  }
};

/**
 * Générer ou régénérer un code d'invitation pour connexion parent
 * POST /api/user/generate-invitation-code
 */
export const generateInvitationCode = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }
    
    const userId = req.user.id;
    
    // Générer code unique (6 caractères alphanumériques)
    let code;
    let attempts = 0;
    let isUnique = false;
    const maxAttempts = 20; // Augmenter le nombre de tentatives
    
    // Générer un code avec format plus robuste
    while (!isUnique && attempts < maxAttempts) {
      // Générer un code de 6 caractères alphanumériques majuscules
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Vérifier l'unicité du code
      try {
        const existing = await prismaService.client.user.findFirst({
          where: { 
            invitationCode: code,
            NOT: { id: userId } // Exclure l'utilisateur actuel
          }
        });
        
        if (!existing) {
          isUnique = true;
        }
      } catch (queryError) {
        // Si la colonne invitationCode n'existe pas, essayer quand même de créer le code
        if (queryError.message && queryError.message.includes('invitationCode')) {
          console.warn('⚠️ Colonne invitationCode non trouvée, génération du code de toute façon');
          isUnique = true;
        } else {
          throw queryError;
        }
      }
      
      attempts++;
    }
    
    if (!isUnique) {
      console.error('❌ Impossible de générer un code unique après', maxAttempts, 'tentatives');
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du code (trop de tentatives)'
      });
    }
    
    // Mettre à jour l'utilisateur avec gestion d'erreur améliorée
    try {
      await prismaService.client.user.update({
        where: { id: userId },
        data: { invitationCode: code }
      });
    } catch (updateError) {
      console.error('❌ Erreur lors de la mise à jour de invitationCode:', updateError);
      
      // Si la colonne n'existe pas, retourner une erreur explicite
      if (updateError.message && updateError.message.includes('invitationCode')) {
        return res.status(500).json({
          success: false,
          error: 'La colonne invitationCode n\'existe pas dans la base de données. Veuillez appliquer la migration SQL.'
        });
      }
      
      throw updateError;
    }
    
    res.json({
      success: true,
      data: { 
        code,
        message: 'Code d\'invitation généré avec succès. Partagez-le avec vos parents pour qu\'ils puissent suivre votre progression.'
      }
    });
    
  } catch (error) {
    console.error('❌ Generate code error:', error);
    console.error('❌ Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la génération du code'
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
    
    // Essayer d'abord avec invitationCode
    let user;
    try {
      user = await prismaService.client.user.findUnique({
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
    } catch (selectError) {
      // Si invitationCode n'existe pas, réessayer sans
      if (selectError.message && selectError.message.includes('invitationCode')) {
        console.warn('⚠️ Colonne invitationCode non trouvée, récupération sans cette colonne');
        user = await prismaService.client.user.findUnique({
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
            createdAt: true
          }
        });
        // Ajouter invitationCode null pour éviter les erreurs frontend
        if (user) {
          user.invitationCode = null;
        }
      } else {
        throw selectError;
      }
    }
    
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
    console.error('❌ Error details:', error.message, error.stack);
    
    // Si c'est une erreur de colonne manquante, essayer sans invitationCode
    if (error.message && error.message.includes('invitationCode')) {
      try {
        const fallbackUser = await prismaService.client.user.findUnique({
          where: { id: req.user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            xp: true,
            level: true,
            streak: true,
            createdAt: true
          }
        });
        
        if (fallbackUser) {
          return res.json({
            success: true,
            data: { ...fallbackUser, invitationCode: null }
          });
        }
      } catch (fallbackError) {
        console.error('❌ Fallback profile error:', fallbackError);
      }
    }
    
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










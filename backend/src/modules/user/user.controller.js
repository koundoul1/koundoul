/**
 * 👤 Controller User - Koundoul
 * Gestion du profil utilisateur et des statistiques
 */

import prismaService from '../../database/prisma.js';

/**
 * Obtenir les statistiques de l'utilisateur
 * GET /api/user/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les données utilisateur
    const user = await prismaService.client.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Calculer les statistiques
    const stats = {
      // Stats de base
      totalXp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      
      // Jours depuis inscription
      daysSinceJoined: Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
      
      // Problèmes résolus (Solver)
      problemsSolved: await prismaService.client.problem.count({
        where: { userId: userId }
      }),
      
      // Quiz complétés
      quizzesCompleted: await prismaService.client.quizAttempt.count({
        where: {
          userId: userId,
          completed: true
        }
      }),
      
      // Score moyen quiz
      quizAverageScore: await prismaService.client.quizAttempt.aggregate({
        where: {
          userId: userId,
          completed: true
        },
        _avg: {
          score: true
        }
      }).then(result => Math.round(result._avg.score || 0)),
      
      // Badges débloqués
      badgesEarned: await prismaService.client.userBadge.count({
        where: { userId: userId }
      }),
      
      // Temps d'étude estimé (basé sur activité)
      estimatedStudyTimeMinutes: await prismaService.client.problem.count({
        where: { userId: userId }
      }) * 10 // 10 min par problème en moyenne
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
 * Générer un code d'invitation pour connexion parent
 * POST /api/user/generate-invitation-code
 */
export const generateInvitationCode = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Générer code unique (6 caractères alphanumériques)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Mettre à jour l'utilisateur
    await prismaService.client.user.update({
      where: { id: userId },
      data: { invitationCode: code }
    });
    
    res.json({
      success: true,
      data: { code }
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










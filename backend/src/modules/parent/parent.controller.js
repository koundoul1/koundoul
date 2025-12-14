/**
 * 👨‍👩‍👧‍👦 Controller Parent - Koundoul
 * Gestion du dashboard parents et des liens parent-enfant
 */

import prismaService from '../../database/prisma.js';

/**
 * Obtenir le dashboard parent pour un enfant
 * GET /api/parent/dashboard/:childId
 */
export const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childId } = req.params;
    
    // Vérifier que le lien parent-enfant existe
    const link = await prismaService.client.parentChildLink.findUnique({
      where: {
        parentId_childId: {
          parentId: parentId,
          childId: childId
        }
      }
    });
    
    if (!link) {
      return res.status(403).json({
        success: false,
        error: 'Vous n\'avez pas accès aux données de cet enfant'
      });
    }
    
    // Récupérer les infos de l'enfant
    const child = await prismaService.client.user.findUnique({
      where: { id: childId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });
    
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Enfant non trouvé'
      });
    }
    
    // Date il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Statistiques hebdomadaires
    const weeklySummary = {
      studyTime: await getStudyTime(childId, 7),
      exercisesCompleted: await prismaService.client.problem.count({
        where: {
          userId: childId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      progression: 12, // TODO: Calculer progression réelle
      weeklyGoal: 85,
      daysActive: await getDaysActive(childId, 7),
      consecutiveDays: child.streak || 0
    };
    
    // Progression par matière
    const subjectsProgress = await getSubjectProgress(childId);
    
    // Points forts et faibles
    const strengths = await getStrongestSubjects(childId);
    const weaknesses = await getWeakestSubjects(childId);
    
    // Alertes intelligentes
    const alerts = [];
    
    // Alerte si pas d'activité depuis 3 jours
    const lastActivity = await prismaService.client.problem.findFirst({
      where: { userId: childId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastActivity) {
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceActivity >= 3) {
        alerts.push({
          type: 'warning',
          message: `Aucune activité depuis ${daysSinceActivity} jours. Bon moment pour un petit rappel bienveillant.`,
          icon: 'AlertCircle'
        });
      }
    }
    
    // Alerte si bonne progression
    if (weeklySummary.exercisesCompleted > 15) {
      alerts.push({
        type: 'success',
        message: 'Excellent travail cette semaine ! Progression remarquable.',
        icon: 'Trophy'
      });
    }
    
    // Préparation examens (simulé pour l'instant)
    const examPreparation = {
      simulatedScore: 14.5,
      progression: '+1.2',
      annalsCompleted: '12/30',
      chaptersMastered: '18/25'
    };
    
    // Temps d'écran
    const screenTime = {
      dailyAverage: `${Math.round(weeklySummary.studyTime / 7)} min`,
      longSessions: 0,
      regularBreaks: true,
      nocturnalUsage: false,
      status: 'healthy'
    };
    
    // Objectifs partagés (simulé)
    const sharedGoals = [
      { name: 'Note visée au Bac', target: '15/20', progress: 73 },
      { name: "Temps d'étude/semaine", target: '5h', progress: 90 },
      { name: 'Chapitre prioritaire', target: 'Intégrales', progress: 65 }
    ];
    
    // Recommandations IA (simulé)
    const recommendations = [
      {
        type: 'pedagogy',
        title: 'Pédagogie',
        message: `${child.firstName} progresse bien. Continuez à encourager les efforts plutôt que les résultats.`,
        icon: 'Lightbulb'
      }
    ];
    
    res.json({
      success: true,
      data: {
        child: {
          firstName: child.firstName,
          lastName: child.lastName,
          email: child.email,
          level: child.level,
          xp: child.xp
        },
        weeklySummary,
        subjectsProgress,
        strengths,
        weaknesses,
        alerts,
        examPreparation,
        screenTime,
        sharedGoals,
        recommendations
      }
    });
    
  } catch (error) {
    console.error('❌ Parent dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données'
    });
  }
};

/**
 * Lister les enfants d'un parent
 * GET /api/parent/children
 */
export const getChildren = async (req, res) => {
  try {
    const parentId = req.user.id;
    
    const links = await prismaService.client.parentChildLink.findMany({
      where: { parentId: parentId },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            level: true,
            xp: true,
            streak: true
          }
        }
      }
    });
    
    const children = links.map(link => ({
      id: link.child.id,
      name: `${link.child.firstName} ${link.child.lastName}`,
      email: link.child.email,
      level: link.child.level,
      xp: link.child.xp,
      streak: link.child.streak
    }));
    
    res.json({
      success: true,
      data: children
    });
    
  } catch (error) {
    console.error('❌ Get children error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des enfants'
    });
  }
};

/**
 * Ajouter un lien parent-enfant (avec code invitation)
 * POST /api/parent/add-child
 */
export const addChild = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { invitationCode } = req.body;
    
    if (!invitationCode) {
      return res.status(400).json({
        success: false,
        error: 'Code d\'invitation requis'
      });
    }
    
    // Trouver l'enfant avec ce code d'invitation
    const child = await prismaService.client.user.findFirst({
      where: { invitationCode: invitationCode }
    });
    
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Code d\'invitation invalide'
      });
    }
    
    // Créer le lien
    await prismaService.client.parentChildLink.create({
      data: {
        parentId: parentId,
        childId: child.id,
        approved: true
      }
    });
    
    res.json({
      success: true,
      message: 'Enfant ajouté avec succès',
      data: {
        childName: `${child.firstName} ${child.lastName}`,
        childEmail: child.email
      }
    });
    
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Cet enfant est déjà lié à votre compte'
      });
    }
    
    console.error('❌ Add child error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout de l\'enfant'
    });
  }
};

// ==================== HELPERS ====================

/**
 * Calculer le temps d'étude (estimation basée sur activité)
 */
async function getStudyTime(userId, days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const problemsCount = await prismaService.client.problem.count({
    where: {
      userId: userId,
      createdAt: { gte: date }
    }
  });
  
  // Estimation: 10 min par problème
  const minutes = problemsCount * 10;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculer le nombre de jours actifs
 */
async function getDaysActive(userId, days) {
  const date = new Date();
  date.setDate(date.setDate() - days);
  
  const activities = await prismaService.client.problem.findMany({
    where: {
      userId: userId,
      createdAt: { gte: date }
    },
    select: {
      createdAt: true
    }
  });
  
  // Compter les jours uniques
  const uniqueDays = new Set(
    activities.map(a => new Date(a.createdAt).toDateString())
  );
  
  return uniqueDays.size;
}

/**
 * Obtenir la progression par matière
 */
async function getSubjectProgress(userId) {
  // Récupérer les problèmes par domaine
  const problems = await prismaService.client.problem.groupBy({
    by: ['subject'],
    where: { userId: userId },
    _count: { id: true }
  });
  
  const subjectMap = {
    'math': { name: 'Mathématiques', color: 'blue' },
    'physics': { name: 'Physique', color: 'purple' },
    'chemistry': { name: 'Chimie', color: 'green' },
    'biology': { name: 'SVT', color: 'emerald' }
  };
  
  return problems.map(p => ({
    name: subjectMap[p.subject]?.name || p.subject,
    progress: Math.min(Math.round((p._count.id / 50) * 100), 100), // Max 100%
    status: p._count.id > 30 ? 'good' : 'warning',
    trend: '+' + Math.round(Math.random() * 5) + '%' // TODO: Calculer vraie tendance
  }));
}

/**
 * Obtenir les matières les plus fortes
 */
async function getStrongestSubjects(userId) {
  const problems = await prismaService.client.problem.groupBy({
    by: ['subject'],
    where: { userId: userId },
    _count: { id: true }
  });
  
  return problems
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 3)
    .map(p => `Bonne maîtrise en ${p.subject}`);
}

/**
 * Obtenir les matières les plus faibles
 */
async function getWeakestSubjects(userId) {
  const problems = await prismaService.client.problem.groupBy({
    by: ['subject'],
    where: { userId: userId },
    _count: { id: true }
  });
  
  return problems
    .sort((a, b) => a._count.id - b._count.id)
    .slice(0, 3)
    .map(p => `Peu d'activité en ${p.subject}`);
}

export default {
  getParentDashboard,
  getChildren,
  addChild
};










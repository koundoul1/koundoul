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
        id: true,
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
    
    // Dates pour calculs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    // Calculer les statistiques en parallèle
    const [
      problemsThisWeek,
      problemsLastWeek,
      problemsTotal,
      quizzesThisWeek,
      lessonsThisWeek,
      exercisesThisWeek,
      quizzesLastWeek
    ] = await Promise.all([
      prismaService.client.problem.count({
        where: {
          userId: childId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prismaService.client.problem.count({
        where: {
          userId: childId,
          createdAt: { 
            gte: fourteenDaysAgo, 
            lt: sevenDaysAgo 
          }
        }
      }),
      prismaService.client.problem.count({
        where: { userId: childId }
      }),
      prismaService.client.quizAttempt.count({
        where: {
          userId: childId,
          status: 'COMPLETED',
          completedAt: { gte: sevenDaysAgo }
        }
      }),
      prismaService.client.lessonCompletion.count({
        where: {
          userId: childId,
          completed: true,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prismaService.client.exerciseAttempt.count({
        where: {
          userId: childId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prismaService.client.quizAttempt.count({
        where: {
          userId: childId,
          status: 'COMPLETED',
          completedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
        }
      })
    ]);
    
    // Calculer le temps d'étude de la semaine (en minutes)
    const studyTimeMinutes = 
      (problemsThisWeek * 10) +
      (quizzesThisWeek * 15) +
      (lessonsThisWeek * 20) +
      (exercisesThisWeek * 8);
    const studyTimeHours = Math.floor(studyTimeMinutes / 60);
    const studyTimeMins = studyTimeMinutes % 60;
    
    // Calculer la progression (comparaison avec semaine dernière)
    const totalThisWeek = problemsThisWeek + quizzesThisWeek + lessonsThisWeek + exercisesThisWeek;
    const lessonsLastWeek = await prismaService.client.lessonCompletion.count({
      where: {
        userId: childId,
        completed: true,
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });
    const exercisesLastWeek = await prismaService.client.exerciseAttempt.count({
      where: {
        userId: childId,
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    });
    const totalLastWeek = problemsLastWeek + quizzesLastWeek + lessonsLastWeek + exercisesLastWeek;
    
    const progression = totalLastWeek > 0 
      ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
      : (totalThisWeek > 0 ? 100 : 0);
    
    // Objectif hebdomadaire (basé sur moyenne des 4 dernières semaines)
    const weeklyGoal = Math.min(Math.round((totalLastWeek > 0 ? totalLastWeek * 1.1 : 10)), 100); // 10% de plus que la semaine dernière, min 10
    
    // Statistiques hebdomadaires complètes
    const weeklySummary = {
      studyTime: `${studyTimeHours}h${studyTimeMins.toString().padStart(2, '0')}`,
      exercisesCompleted: problemsThisWeek + exercisesThisWeek,
      quizzesCompleted: quizzesThisWeek,
      lessonsCompleted: lessonsThisWeek,
      progression,
      weeklyGoal,
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
    
    // Préparation examens (basé sur quiz complétés avec scores)
    const quizAttempts = await prismaService.client.quizAttempt.findMany({
      where: {
        userId: childId,
        status: 'COMPLETED'
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    });
    
    // Calculer score moyen récent (sur 20 points)
    const recentScores = quizAttempts
      .filter(q => q.completedAt && new Date(q.completedAt) >= sevenDaysAgo)
      .map(q => {
        // Convertir le score en note sur 20 (score est sur 100 normalement)
        return q.score ? (q.score / 100) * 20 : 0;
      });
    
    const simulatedScore = recentScores.length > 0
      ? Math.round((recentScores.reduce((a, b) => a + b, 0) / recentScores.length) * 10) / 10
      : 0;
    
    // Comparer avec la période précédente (14-30 jours)
    const olderScores = quizAttempts
      .filter(q => {
        if (!q.completedAt) return false;
        const date = new Date(q.completedAt);
        return date >= thirtyDaysAgo && date < sevenDaysAgo;
      })
      .map(q => q.score ? (q.score / 100) * 20 : 0);
    
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      : 0;
    
    const examProgression = olderAvg > 0
      ? (simulatedScore >= olderAvg ? '+' : '') + (Math.round((simulatedScore - olderAvg) * 10) / 10).toFixed(1)
      : simulatedScore > 0 ? `+${simulatedScore.toFixed(1)}` : '0';
    
    // Compter les quiz complétés (approximation pour "annales")
    const annalsCompleted = quizAttempts.length;
    
    // Calculer le nombre total de quiz disponibles (dynamique)
    const annalsTotal = await prismaService.client.quiz.count({
      where: {
        isActive: true
      }
    });
    
    // Compter les chapitres maîtrisés (leçons complétées)
    const chaptersMastered = await prismaService.client.lessonCompletion.count({
      where: {
        userId: childId,
        completed: true
      }
    });
    
    // Calculer le nombre total de leçons disponibles (dynamique)
    const chaptersTotal = await prismaService.client.lesson.count();
    
    const examPreparation = {
      simulatedScore,
      progression: examProgression,
      annalsCompleted: `${annalsCompleted}/${annalsTotal}`,
      chaptersMastered: `${chaptersMastered}/${chaptersTotal}`
    };
    
    // Temps d'écran (basé sur activité réelle)
    const dailyAverageMinutes = Math.round(studyTimeMinutes / 7);
    const dailyAverageHours = Math.floor(dailyAverageMinutes / 60);
    const dailyAverageMins = dailyAverageMinutes % 60;
    
    // Sessions longues (> 2h) cette semaine
    // Estimation: si temps journalier > 120 min, c'est une session longue
    const longSessions = dailyAverageMinutes > 120 ? Math.floor(studyTimeMinutes / 120) : 0;
    
    // Usage nocturne (activité après 22h ou avant 6h)
    const nocturnalActivities = await prismaService.client.problem.findMany({
      where: {
        userId: childId,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    });
    
    const nocturnalUsage = nocturnalActivities.some(act => {
      const hour = new Date(act.createdAt).getHours();
      return hour >= 22 || hour < 6;
    });
    
    const screenTime = {
      dailyAverage: dailyAverageHours > 0 
        ? `${dailyAverageHours}h${dailyAverageMins.toString().padStart(2, '0')}`
        : `${dailyAverageMins} min`,
      longSessions,
      regularBreaks: dailyAverageMinutes <= 180, // Considéré sain si < 3h/jour
      nocturnalUsage,
      status: dailyAverageMinutes <= 180 && !nocturnalUsage && longSessions === 0 ? 'healthy' : 'warning'
    };
    
    // Objectifs partagés (basés sur progression réelle et objectifs adaptatifs)
    // Calculer la moyenne des scores de tous les quiz pour définir un objectif réaliste
    const allQuizAttempts = await prismaService.client.quizAttempt.findMany({
      where: {
        userId: childId,
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: { score: true }
    });
    
    // Calculer la moyenne des scores (score est sur 100, convertir en note sur 20)
    const avgScoreAllTime = allQuizAttempts.length > 0
      ? Math.round((allQuizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / allQuizAttempts.length) / 100 * 20 * 10) / 10
      : 12; // Valeur par défaut si aucun quiz complété
    
    // Objectif de note : 10% au-dessus de la moyenne actuelle, minimum 12/20, maximum 18/20
    const targetScore = Math.min(Math.max(Math.round((avgScoreAllTime * 1.1) * 10) / 10, 12), 18);
    
    // Objectif de temps : basé sur la moyenne hebdomadaire récente + 20%, minimum 3h
    // Si pas d'activité la semaine dernière, utiliser cette semaine comme base
    const baseStudyHours = studyTimeHours > 0 ? studyTimeHours : (totalLastWeek > 0 ? studyTimeMinutes / 60 : 3);
    const targetStudyHours = Math.max(Math.round((baseStudyHours * 1.2) * 10) / 10, 3);
    
    const sharedGoals = [
      { 
        name: 'Note visée au Bac', 
        target: `${targetScore}/20`, 
        progress: simulatedScore > 0 
          ? Math.min(Math.round((simulatedScore / targetScore) * 100), 100)
          : 0
      },
      { 
        name: "Temps d'étude/semaine", 
        target: `${targetStudyHours}h`, 
        progress: studyTimeHours > 0
          ? Math.min(Math.round((studyTimeHours / targetStudyHours) * 100), 100)
          : 0
      },
      { 
        name: 'Chapitres maîtrisés', 
        target: `${chaptersTotal} chapitres`, 
        progress: chaptersTotal > 0
          ? Math.min(Math.round((chaptersMastered / chaptersTotal) * 100), 100)
          : 0
      }
    ];
    
    // Recommandations basées sur l'analyse réelle
    const recommendations = [];
    
    if (progression > 0) {
      recommendations.push({
        type: 'success',
        title: 'Progression',
        message: `${child.firstName || 'Votre enfant'} progresse bien cette semaine ! Continuez à encourager les efforts.`,
        icon: 'TrendingUp'
      });
    }
    
    if (weeklySummary.daysActive < 3) {
      recommendations.push({
        type: 'warning',
        title: 'Régularité',
        message: `Seulement ${weeklySummary.daysActive} jour${weeklySummary.daysActive > 1 ? 's' : ''} actif${weeklySummary.daysActive > 1 ? 's' : ''} cette semaine. Encouragez une pratique régulière.`,
        icon: 'Calendar'
      });
    }
    
    if (subjectsProgress.length > 0) {
      const weakest = subjectsProgress.sort((a, b) => a.progress - b.progress)[0];
      if (weakest.progress < 50) {
        recommendations.push({
          type: 'suggestion',
          title: 'Matière à renforcer',
          message: `${weakest.name} nécessite plus d'attention (${weakest.progress}% de progression). Proposez des ressources complémentaires.`,
          icon: 'BookOpen'
        });
      }
    }
    
    // Recommandation par défaut si aucune autre
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'Pédagogie',
        message: `${child.firstName || 'Votre enfant'} progresse bien. Continuez à encourager les efforts plutôt que les résultats.`,
        icon: 'Lightbulb'
      });
    }
    
    res.json({
      success: true,
      data: {
        child: {
          id: childId,
          firstName: child.firstName,
          lastName: child.lastName,
          name: `${child.firstName || ''} ${child.lastName || ''}`.trim() || child.email,
          email: child.email,
          level: child.level,
          xp: child.xp,
          streak: child.streak,
          createdAt: child.createdAt
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
 * Calculer le temps d'étude (estimation basée sur toutes les activités)
 */
async function getStudyTime(userId, days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const [problemsCount, quizzesCount, lessonsCount, exercisesCount] = await Promise.all([
    prismaService.client.problem.count({
      where: {
        userId: userId,
        createdAt: { gte: date }
      }
    }),
    prismaService.client.quizAttempt.count({
      where: {
        userId: userId,
        status: 'COMPLETED',
        completedAt: { gte: date }
      }
    }),
    prismaService.client.lessonCompletion.count({
      where: {
        userId: userId,
        completed: true,
        createdAt: { gte: date }
      }
    }),
    prismaService.client.exerciseAttempt.count({
      where: {
        userId: userId,
        createdAt: { gte: date }
      }
    })
  ]);
  
  // Estimation: 10 min par problème, 15 min par quiz, 20 min par leçon, 8 min par exercice
  const minutes = (problemsCount * 10) + (quizzesCount * 15) + (lessonsCount * 20) + (exercisesCount * 8);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculer le nombre de jours actifs (toutes activités confondues)
 */
async function getDaysActive(userId, days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const [problems, quizzes, lessons, exercises] = await Promise.all([
    prismaService.client.problem.findMany({
      where: {
        userId: userId,
        createdAt: { gte: date }
      },
      select: { createdAt: true }
    }),
    prismaService.client.quizAttempt.findMany({
      where: {
        userId: userId,
        completedAt: { gte: date }
      },
      select: { completedAt: true }
    }),
    prismaService.client.lessonCompletion.findMany({
      where: {
        userId: userId,
        createdAt: { gte: date }
      },
      select: { createdAt: true }
    }),
    prismaService.client.exerciseAttempt.findMany({
      where: {
        userId: userId,
        createdAt: { gte: date }
      },
      select: { createdAt: true }
    })
  ]);
  
  // Compter les jours uniques (toutes activités confondues)
  const allDates = [
    ...problems.map(p => new Date(p.createdAt).toDateString()),
    ...quizzes.map(q => new Date(q.completedAt).toDateString()),
    ...lessons.map(l => new Date(l.createdAt).toDateString()),
    ...exercises.map(e => new Date(e.createdAt).toDateString())
  ];
  
  const uniqueDays = new Set(allDates);
  
  return uniqueDays.size;
}

/**
 * Obtenir la progression par matière (basée sur problèmes et quiz)
 */
async function getSubjectProgress(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  // Récupérer les problèmes par matière
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
  
  // Calculer progression cette semaine vs semaine dernière pour chaque matière
  const progressData = await Promise.all(
    problems.map(async (p) => {
      const thisWeek = await prismaService.client.problem.count({
        where: {
          userId: userId,
          subject: p.subject,
          createdAt: { gte: sevenDaysAgo }
        }
      });
      const lastWeek = await prismaService.client.problem.count({
        where: {
          userId: userId,
          subject: p.subject,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
        }
      });
      
      const trend = lastWeek > 0 
        ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
        : (thisWeek > 0 ? 100 : 0);
      
      return {
        subject: p.subject,
        count: p._count.id,
        thisWeek,
        lastWeek,
        trend
      };
    })
  );
  
  return progressData.map(p => ({
    name: subjectMap[p.subject]?.name || p.subject,
    progress: Math.min(Math.round((p.count / 50) * 100), 100), // Max 100%
    status: p.count > 30 ? 'good' : p.count > 15 ? 'warning' : 'alert',
    trend: p.trend >= 0 ? `+${p.trend}%` : `${p.trend}%`
  }));
}

/**
 * Obtenir les matières les plus fortes (basé sur nombre d'activités)
 */
async function getStrongestSubjects(userId) {
  const subjectMap = {
    'math': 'Mathématiques',
    'physics': 'Physique',
    'chemistry': 'Chimie',
    'biology': 'SVT'
  };
  
  // Compter problèmes par matière
  const problems = await prismaService.client.problem.groupBy({
    by: ['subject'],
    where: { userId: userId },
    _count: { id: true }
  });
  
  if (problems.length === 0) {
    return ['Commencez à résoudre des problèmes pour voir vos points forts !'];
  }
  
  // Trier par nombre d'activités (plus élevé d'abord)
  const strengths = problems
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 3);
  
  return strengths.map(p => 
    `Bonne maîtrise en ${subjectMap[p.subject] || p.subject} (${p._count.id} problème${p._count.id > 1 ? 's' : ''} résolu${p._count.id > 1 ? 's' : ''})`
  );
}

/**
 * Obtenir les matières les plus faibles (basé sur faible activité)
 */
async function getWeakestSubjects(userId) {
  const subjectMap = {
    'math': 'Mathématiques',
    'physics': 'Physique',
    'chemistry': 'Chimie',
    'biology': 'SVT'
  };
  
  // Compter problèmes par matière
  const problems = await prismaService.client.problem.groupBy({
    by: ['subject'],
    where: { userId: userId },
    _count: { id: true }
  });
  
  // Si aucune activité, retourner message générique
  if (problems.length === 0) {
    return ['Peu d\'activité enregistrée. Commencez par résoudre quelques problèmes !'];
  }
  
  // Trier par nombre d'activités (plus faible d'abord)
  const weaknesses = problems
    .sort((a, b) => a._count.id - b._count.id)
    .slice(0, 3);
  
  return weaknesses.map(p => 
    `Peu d'activité en ${subjectMap[p.subject] || p.subject} (${p._count.id} problème${p._count.id > 1 ? 's' : ''} résolu${p._count.id > 1 ? 's' : ''}). Continuez à vous exercer !`
  );
}

export default {
  getParentDashboard,
  getChildren,
  addChild
};










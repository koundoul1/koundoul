import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

// Définition des badges
const BADGE_DEFINITIONS = [
  // Badges de démarrage
  {
    id: 'first_lesson',
    name: 'Premier Pas',
    description: 'Complète ta première leçon',
    icon: '📚',
    color: '#3B82F6',
    condition: 'lessonsCompleted >= 1'
  },
  {
    id: 'first_exercise',
    name: 'En Action',
    description: 'Résous ton premier exercice',
    icon: '✏️',
    color: '#10B981',
    condition: 'exercisesCorrect >= 1'
  },
  {
    id: 'first_quiz',
    name: 'Quiz Master',
    description: 'Réussis ton premier quiz',
    icon: '🎯',
    color: '#F59E0B',
    condition: 'quizzesPassed >= 1'
  },

  // Badges de leçons
  {
    id: 'lessons_5',
    name: 'Étudiant Assidu',
    description: 'Complète 5 leçons',
    icon: '📖',
    color: '#3B82F6',
    condition: 'lessonsCompleted >= 5'
  },
  {
    id: 'lessons_10',
    name: 'Lecteur Avide',
    description: 'Complète 10 leçons',
    icon: '📚',
    color: '#2563EB',
    condition: 'lessonsCompleted >= 10'
  },
  {
    id: 'lessons_25',
    name: 'Érudit',
    description: 'Complète 25 leçons',
    icon: '🎓',
    color: '#1E40AF',
    condition: 'lessonsCompleted >= 25'
  },

  // Badges d'exercices
  {
    id: 'exercises_10',
    name: 'Pratiquant',
    description: 'Résous 10 exercices correctement',
    icon: '✅',
    color: '#10B981',
    condition: 'exercisesCorrect >= 10'
  },
  {
    id: 'exercises_25',
    name: 'Expert en Pratique',
    description: 'Résous 25 exercices correctement',
    icon: '🏆',
    color: '#059669',
    condition: 'exercisesCorrect >= 25'
  },
  {
    id: 'exercises_50',
    name: 'Maître des Exercices',
    description: 'Résous 50 exercices correctement',
    icon: '👑',
    color: '#047857',
    condition: 'exercisesCorrect >= 50'
  },

  // Badges de quiz
  {
    id: 'quiz_5',
    name: 'Champion de Quiz',
    description: 'Réussis 5 quiz',
    icon: '🌟',
    color: '#F59E0B',
    condition: 'quizzesPassed >= 5'
  },
  {
    id: 'quiz_perfect',
    name: 'Perfection',
    description: 'Obtiens 100% à un quiz',
    icon: '💯',
    color: '#DC2626',
    condition: 'perfectQuiz >= 1'
  },

  // Badges de streak
  {
    id: 'streak_3',
    name: 'Régularité',
    description: '3 jours consécutifs',
    icon: '🔥',
    color: '#F97316',
    condition: 'streak >= 3'
  },
  {
    id: 'streak_7',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs',
    icon: '🔥',
    color: '#EA580C',
    condition: 'streak >= 7'
  },
  {
    id: 'streak_30',
    name: 'Mois de Feu',
    description: '30 jours consécutifs',
    icon: '🔥',
    color: '#C2410C',
    condition: 'streak >= 30'
  },

  // Badges de XP
  {
    id: 'xp_500',
    name: 'Montée en Puissance',
    description: 'Atteins 500 XP',
    icon: '⚡',
    color: '#8B5CF6',
    condition: 'totalXp >= 500'
  },
  {
    id: 'xp_1000',
    name: 'Expert',
    description: 'Atteins 1000 XP',
    icon: '💪',
    color: '#7C3AED',
    condition: 'totalXp >= 1000'
  },
  {
    id: 'xp_5000',
    name: 'Légende',
    description: 'Atteins 5000 XP',
    icon: '👑',
    color: '#6D28D9',
    condition: 'totalXp >= 5000'
  },

  // Badges spéciaux
  {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Complète une leçon avant 8h',
    icon: '🌅',
    color: '#F59E0B',
    condition: 'earlyBird >= 1'
  },
  {
    id: 'night_owl',
    name: 'Oiseau de Nuit',
    description: 'Complète une leçon après 22h',
    icon: '🦉',
    color: '#6366F1',
    condition: 'nightOwl >= 1'
  }
];

class BadgesService {
  
  // Vérifier et débloquer les badges pour un utilisateur
  async checkAndUnlockBadges(userId) {
    // Récupérer les stats de l'utilisateur
    const stats = await this.getUserStats(userId);
    
    // Récupérer les badges déjà débloqués
    const unlockedBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    });
    
    const unlockedBadgeIds = unlockedBadges.map(b => b.badgeId);
    const newBadges = [];

    // Vérifier chaque badge
    for (const badge of BADGE_DEFINITIONS) {
      // Si déjà débloqué, skip
      if (unlockedBadgeIds.includes(badge.id)) continue;

      // Vérifier la condition
      if (this.evaluateCondition(badge.condition, stats)) {
        // Débloquer le badge
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        });

        newBadges.push({
          ...badge,
          unlockedAt: userBadge.earnedAt
        });

        // Ajouter bonus XP pour déblocage badge
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: 50 }
          }
        });
      }
    }

    return newBadges;
  }

  // Récupérer les statistiques utilisateur pour l'évaluation des badges
  async getUserStats(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    });

    const lessonsCompleted = await prisma.lessonCompletion.count({
      where: { userId }
    });

    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: { userId }
    });

    const exercisesCorrect = exerciseAttempts.filter(a => a.isCorrect).length;

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId, status: 'COMPLETED' }
    });

    const quizzesPassed = quizAttempts.filter(a => a.passed).length;
    
    // Chercher un quiz avec 100%
    let perfectQuiz = 0;
    for (const attempt of quizAttempts) {
      if (attempt.passed && attempt.score) {
        // Récupérer le quiz pour connaître le score max
        const quiz = await prisma.quiz.findUnique({
          where: { id: attempt.quizId },
          include: { questions: true }
        });
        const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        if (attempt.score === maxScore) {
          perfectQuiz++;
          break; // On en a trouvé un, c'est suffisant
        }
      }
    }

    // Calculer le streak
    const streak = await this.calculateStreak(userId);

    // Vérifier early bird et night owl
    const lessonCompletions = await prisma.lessonCompletion.findMany({
      where: { userId }
    });

    const earlyBird = lessonCompletions.filter(l => {
      const hour = new Date(l.createdAt).getHours();
      return hour < 8;
    }).length;

    const nightOwl = lessonCompletions.filter(l => {
      const hour = new Date(l.createdAt).getHours();
      return hour >= 22;
    }).length;

    return {
      totalXp: user.xp,
      lessonsCompleted,
      exercisesCorrect,
      quizzesPassed,
      perfectQuiz,
      streak,
      earlyBird,
      nightOwl
    };
  }

  // Évaluer une condition de badge
  evaluateCondition(condition, stats) {
    try {
      // Remplacer les variables par leurs valeurs
      let evaluable = condition;
      for (const [key, value] of Object.entries(stats)) {
        evaluable = evaluable.replace(new RegExp(key, 'g'), value);
      }
      
      // Évaluer l'expression (sécurisé car on contrôle les conditions)
      return eval(evaluable);
    } catch (error) {
      console.error('Erreur évaluation condition:', error);
      return false;
    }
  }

  // Calculer le streak
  async calculateStreak(userId) {
    const activities = await prisma.lessonCompletion.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of activities) {
      const activityDate = new Date(activity.createdAt);
      activityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }

  // Récupérer tous les badges d'un utilisateur
  async getUserBadges(userId) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    });

    return userBadges.map(ub => {
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === ub.badgeId);
      return {
        ...badgeDef,
        unlockedAt: ub.earnedAt
      };
    });
  }

  // Récupérer tous les badges disponibles avec status
  async getAllBadgesWithStatus(userId) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId }
    });

    const unlockedIds = userBadges.map(b => b.badgeId);

    return BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      unlocked: unlockedIds.includes(badge.id),
      unlockedAt: userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
    }));
  }

  // Stats des badges
  async getBadgeStats(userId) {
    const userBadges = await prisma.userBadge.count({
      where: { userId }
    });

    const totalBadges = BADGE_DEFINITIONS.length;
    const percentage = Math.round((userBadges / totalBadges) * 100);

    return {
      unlocked: userBadges,
      total: totalBadges,
      percentage
    };
  }
}

export default new BadgesService();



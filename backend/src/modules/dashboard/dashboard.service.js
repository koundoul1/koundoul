import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

class DashboardService {
  
  async getUserDashboard(userId) {
    // 1. User & Stats de base
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        xp: true,
        level: true,
        createdAt: true
      }
    });

    // 2. Leçons complétées
    const lessonsCompleted = await prisma.lessonCompletion.count({
      where: { userId }
    });

    const totalTimeSpentLessons = await prisma.lessonCompletion.aggregate({
      where: { userId },
      _sum: { timeSpent: true }
    });

    // 3. Exercices
    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: { userId },
      include: {
        exercise: {
          include: {
            chapter: true,
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const exerciseStats = await prisma.exerciseAttempt.groupBy({
      by: ['isCorrect'],
      where: { userId },
      _count: true
    });

    const totalExercises = exerciseStats.reduce((acc, stat) => acc + stat._count, 0);
    const correctExercises = exerciseStats.find(s => s.isCorrect)?._count || 0;
    const successRate = totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0;

    // 4. Progression par matière
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          include: {
            lessons: {
              include: {
                completions: {
                  where: { userId }
                }
              }
            },
            exercises: {
              include: {
                attempts: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    const subjectProgress = subjects.map(subject => {
      const totalLessons = subject.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
      const completedLessons = subject.chapters.reduce((acc, ch) => 
        acc + ch.lessons.filter(l => l.completions.length > 0).length, 0);

      const totalExercises = subject.chapters.reduce((acc, ch) => acc + ch.exercises.length, 0);
      const attemptedExercises = subject.chapters.reduce((acc, ch) => 
        acc + ch.exercises.filter(e => e.attempts.length > 0).length, 0);

      const lessonProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const exerciseProgress = totalExercises > 0 ? Math.round((attemptedExercises / totalExercises) * 100) : 0;

      return {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        icon: subject.icon,
        color: subject.color,
        lessons: {
          total: totalLessons,
          completed: completedLessons,
          progress: lessonProgress
        },
        exercises: {
          total: totalExercises,
          attempted: attemptedExercises,
          progress: exerciseProgress
        },
        overallProgress: Math.round((lessonProgress + exerciseProgress) / 2)
      };
    });

    // 5. Chapitres en cours
    const recentCompletions = await prisma.lessonCompletion.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                subject: true,
                lessons: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const chaptersInProgress = recentCompletions
      .map(c => c.lesson.chapter)
      .filter((chapter, index, self) => 
        index === self.findIndex(ch => ch.id === chapter.id)
      )
      .slice(0, 3);

    // 6. Recommandations
    const recommendations = await this.getRecommendations(userId, subjectProgress);

    // 7. Activité récente
    const recentActivity = await this.getRecentActivity(userId);

    // 8. Streak (jours consécutifs)
    const streak = await this.calculateStreak(userId);

    return {
      profile: {
        ...user,
        level: this.calculateLevel(user.xp),
        nextLevelXp: this.getNextLevelXp(user.xp)
      },
      stats: {
        lessonsCompleted,
        exercisesAttempted: totalExercises,
        exercisesCorrect: correctExercises,
        successRate,
        totalTimeSpent: Math.floor((totalTimeSpentLessons._sum.timeSpent || 0) / 60), // en minutes
        streak
      },
      subjectProgress,
      chaptersInProgress,
      recommendations,
      recentActivity
    };
  }

  calculateLevel(xp) {
    // Niveau = racine carrée de (XP / 100)
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  getNextLevelXp(xp) {
    const currentLevel = this.calculateLevel(xp);
    const nextLevel = currentLevel + 1;
    return Math.pow(nextLevel - 1, 2) * 100;
  }

  async getRecommendations(userId, subjectProgress) {
    const recommendations = [];

    // Recommandation 1 : Matière avec le moins de progrès
    const lowestProgress = subjectProgress
      .filter(s => s.overallProgress < 100)
      .sort((a, b) => a.overallProgress - b.overallProgress)[0];

    if (lowestProgress && lowestProgress.overallProgress < 30) {
      recommendations.push({
        type: 'SUBJECT',
        priority: 'HIGH',
        title: `Continue ton parcours en ${lowestProgress.name}`,
        description: `Tu n'as complété que ${lowestProgress.overallProgress}% de ce cours. C'est le moment de progresser !`,
        action: `/courses/${lowestProgress.slug}`,
        icon: lowestProgress.icon
      });
    }

    // Recommandation 2 : Exercices non tentés
    const subjectWithExercises = subjectProgress.find(s => 
      s.exercises.attempted < s.exercises.total && s.lessons.progress > 50
    );

    if (subjectWithExercises) {
      recommendations.push({
        type: 'EXERCISE',
        priority: 'MEDIUM',
        title: 'Entraîne-toi avec des exercices',
        description: `${subjectWithExercises.exercises.total - subjectWithExercises.exercises.attempted} exercices t'attendent en ${subjectWithExercises.name}`,
        action: `/courses/${subjectWithExercises.slug}`,
        icon: '🎯'
      });
    }

    // Recommandation 3 : Révision
    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId,
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Plus de 7 jours
        }
      }
    });

    if (completedLessons > 5) {
      recommendations.push({
        type: 'REVIEW',
        priority: 'LOW',
        title: 'Révise tes anciennes leçons',
        description: 'La révision espacée améliore la mémorisation à long terme',
        action: '/courses',
        icon: '🔄'
      });
    }

    return recommendations;
  }

  async getRecentActivity(userId) {
    const [lessons, exercises] = await Promise.all([
      prisma.lessonCompletion.findMany({
        where: { userId },
        include: {
          lesson: {
            include: {
              chapter: {
                include: { subject: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.exerciseAttempt.findMany({
        where: { userId },
        include: {
          exercise: {
            include: {
              chapter: {
                include: { subject: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const activities = [
      ...lessons.map(l => ({
        type: 'LESSON',
        title: l.lesson.title,
        subject: l.lesson.chapter.subject.name,
        icon: l.lesson.chapter.subject.icon,
        date: l.createdAt,
        xp: 5
      })),
      ...exercises.map(e => ({
        type: 'EXERCISE',
        title: e.exercise.title,
        subject: e.exercise.chapter.subject.name,
        icon: e.exercise.chapter.subject.icon,
        date: e.createdAt,
        xp: e.score,
        isCorrect: e.isCorrect
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    return activities;
  }

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
}

export default new DashboardService();



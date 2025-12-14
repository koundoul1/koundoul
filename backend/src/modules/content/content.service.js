import prismaService from '../../database/prisma.js';
import badgesService from '../badges/badges.service.js';

const prisma = prismaService.client || prismaService;

class ContentService {
  
  // ===== SUBJECTS =====
  
  async getAllSubjects() {
    return await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { chapters: true, exercises: true }
        }
      }
    });
  }

  async getSubjectBySlug(slug) {
    return await prisma.subject.findUnique({
      where: { slug },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { lessons: true, exercises: true }
            }
          }
        }
      }
    });
  }

  // ===== CHAPTERS =====
  
  async getChaptersByLevel(subjectSlug, level) {
    return await prisma.chapter.findMany({
      where: {
        subject: { slug: subjectSlug },
        level: level
      },
      orderBy: { order: 'asc' },
      include: {
        subject: true,
        _count: {
          select: { lessons: true, exercises: true, quizzes: true }
        }
      }
    });
  }

  async getChapterBySlug(subjectSlug, chapterSlug) {
    return await prisma.chapter.findFirst({
      where: {
        subject: { slug: subjectSlug },
        slug: chapterSlug
      },
      include: {
        subject: true,
        lessons: {
          orderBy: { order: 'asc' }
        },
        exercises: {
          orderBy: { difficulty: 'asc' }
        }
      }
    });
  }

  // ===== LESSONS =====
  
  async getLessons(filters = {}) {
    const where = {};
    
    if (filters.chapterId) {
      where.chapterId = filters.chapterId;
    }
    
    // Ne construire les filtres de chapter que si subject ou level ne sont pas "all"
    if ((filters.subject && filters.subject !== 'all') || (filters.level && filters.level !== 'all')) {
      where.chapter = {};
      
      if (filters.subject && filters.subject !== 'all') {
        where.chapter.subject = { slug: filters.subject };
      }
      
      if (filters.level && filters.level !== 'all') {
        where.chapter.level = filters.level.toUpperCase();
      }
    }
    
    return await prisma.lesson.findMany({
      where,
      include: {
        chapter: {
          include: {
            subject: true
          }
        },
        _count: {
          select: { 
            completions: true,
            flashcards: true,
            discussions: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });
  }
  
  async getLessonBySlug(chapterId, lessonSlug) {
    return await prisma.lesson.findFirst({
      where: {
        chapterId: chapterId,
        slug: lessonSlug
      },
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });
  }

  async getLessonById(lessonId) {
    return await prisma.lesson.findUnique({
      where: {
        id: lessonId
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        summary: true,
        objectives: true,
        duration: true,
        order: true,
        chapterId: true,
        videoUrl: true,
        images: true,
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });
  }

  async markLessonComplete(userId, lessonId, timeSpent) {
    const completion = await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        timeSpent: { increment: timeSpent }
      },
      create: {
        userId,
        lessonId,
        timeSpent,
        completed: true
      }
    });

    // Vérifier les badges débloqués
    const newBadges = await badgesService.checkAndUnlockBadges(userId);

    return {
      completion,
      newBadges
    };
  }

  async getUserLessonProgress(userId, chapterId) {
    const completions = await prisma.lessonCompletion.findMany({
      where: {
        userId,
        lesson: {
          chapterId
        }
      },
      include: {
        lesson: true
      }
    });

    return completions;
  }

  // ===== EXERCISES =====
  
  async getExercisesByChapter(chapterId, difficulty = null) {
    const where = { chapterId };
    if (difficulty) {
      where.difficulty = difficulty;
    }

    return await prisma.exercise.findMany({
      where,
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'asc' }
      ]
    });
  }

  async getExerciseById(exerciseId) {
    return await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        subject: true,
        chapter: true
      }
    });
  }

  async submitExerciseAttempt(userId, exerciseId, userAnswer, isCorrect, timeSpent, hintsUsed) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    const score = isCorrect ? exercise.points : 0;

    // Créer la tentative
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        userAnswer,
        isCorrect,
        score,
        timeSpent,
        hintsUsed
      }
    });

    // Si correct, ajouter des XP
    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: score }
        }
      });
    }

    // Vérifier les badges débloqués
    const newBadges = await badgesService.checkAndUnlockBadges(userId);

    return {
      attempt,
      newBadges
    };
  }

  async getUserExerciseStats(userId, chapterId) {
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId,
        exercise: {
          chapterId
        }
      },
      include: {
        exercise: true
      }
    });

    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect).length;
    const successRate = total > 0 ? (correct / total) * 100 : 0;

    return {
      total,
      correct,
      incorrect: total - correct,
      successRate: Math.round(successRate)
    };
  }

  // ===== PROGRESSION =====
  
  async getUserChapterProgress(userId, chapterId) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        lessons: true,
        exercises: true
      }
    });

    if (!chapter) return null;

    const lessonCompletions = await this.getUserLessonProgress(userId, chapterId);
    const exerciseStats = await this.getUserExerciseStats(userId, chapterId);

    const totalLessons = chapter.lessons.length;
    const completedLessons = lessonCompletions.length;
    const lessonProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      chapterId,
      chapterTitle: chapter.title,
      lessons: {
        total: totalLessons,
        completed: completedLessons,
        progress: Math.round(lessonProgress)
      },
      exercises: exerciseStats,
      overallProgress: Math.round((lessonProgress + exerciseStats.successRate) / 2)
    };
  }
}

export default new ContentService();

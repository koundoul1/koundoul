import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

/**
 * Service de Révision Espacée (Spaced Repetition)
 * Implémente l'algorithme SM-2 (SuperMemo 2)
 */
class FlashcardsService {
  
  /**
   * Algorithme SM-2 pour calculer la prochaine révision
   * @param {number} quality - Qualité de la réponse (0-5)
   * @param {number} previousInterval - Intervalle précédent en jours
   * @param {number} previousEaseFactor - Facteur de facilité précédent
   * @param {number} previousRepetitions - Nombre de répétitions précédentes
   * @returns {object} - {interval, easeFactor, repetitions, nextReview}
   */
  calculateSM2(quality, previousInterval = 0, previousEaseFactor = 2.5, previousRepetitions = 0) {
    let interval, easeFactor, repetitions;
    
    // Calculer le nouveau facteur de facilité
    easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Le facteur de facilité ne peut pas être inférieur à 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
    
    // Calculer le nouvel intervalle et les répétitions
    if (quality < 3) {
      // Réponse incorrecte : recommencer depuis le début
      interval = 1;
      repetitions = 0;
    } else {
      // Réponse correcte
      repetitions = previousRepetitions + 1;
      
      if (repetitions === 1) {
        interval = 1; // Premier jour
      } else if (repetitions === 2) {
        interval = 6; // Deuxième révision : 6 jours
      } else {
        // Révisions suivantes : interval * easeFactor
        interval = Math.round(previousInterval * easeFactor);
      }
    }
    
    // Calculer la date de prochaine révision
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      interval,
      easeFactor,
      repetitions,
      nextReview
    };
  }
  
  /**
   * Créer une nouvelle flashcard
   */
  async createFlashcard(data) {
    return await prisma.flashcard.create({
      data: {
        question: data.question,
        answer: data.answer,
        explanation: data.explanation,
        subjectId: data.subjectId,
        lessonId: data.lessonId,
        chapterId: data.chapterId,
        difficulty: data.difficulty || 'FACILE',
        tags: data.tags || []
      },
      include: {
        subject: true,
        lesson: true,
        chapter: true
      }
    });
  }
  
  /**
   * Récupérer toutes les flashcards d'un utilisateur
   */
  async getUserFlashcards(userId, filters = {}) {
    const where = {};
    
    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }
    
    if (filters.lessonId) {
      where.lessonId = filters.lessonId;
    }
    
    if (filters.chapterId) {
      where.chapterId = filters.chapterId;
    }
    
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags
      };
    }
    
    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        subject: true,
        lesson: true,
        chapter: true,
        reviews: {
          where: { userId },
          orderBy: { reviewedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Enrichir avec le statut de révision
    return flashcards.map(fc => {
      const lastReview = fc.reviews[0];
      return {
        ...fc,
        lastReview: lastReview ? {
          reviewedAt: lastReview.reviewedAt,
          nextReview: lastReview.nextReview,
          quality: lastReview.quality,
          repetitions: lastReview.repetitions
        } : null,
        isDue: lastReview ? new Date(lastReview.nextReview) <= new Date() : true,
        isNew: !lastReview
      };
    });
  }
  
  /**
   * Récupérer les flashcards à réviser aujourd'hui
   */
  async getDueFlashcards(userId, limit = 20) {
    const today = new Date();
    
    // Flashcards jamais révisées
    const newFlashcards = await prisma.flashcard.findMany({
      where: {
        reviews: {
          none: {
            userId
          }
        }
      },
      include: {
        subject: true,
        lesson: true,
        chapter: true
      },
      take: limit / 2 // Moitié = nouvelles cartes
    });
    
    // Flashcards à réviser (nextReview <= aujourd'hui)
    const dueFlashcards = await prisma.flashcard.findMany({
      where: {
        reviews: {
          some: {
            userId,
            nextReview: {
              lte: today
            }
          }
        }
      },
      include: {
        subject: true,
        lesson: true,
        chapter: true,
        reviews: {
          where: { userId },
          orderBy: { reviewedAt: 'desc' },
          take: 1
        }
      },
      take: limit / 2 // Moitié = révisions
    });
    
    return [...newFlashcards, ...dueFlashcards].map(fc => ({
      ...fc,
      isNew: !fc.reviews || fc.reviews.length === 0,
      lastReview: fc.reviews && fc.reviews[0] ? fc.reviews[0] : null
    }));
  }
  
  /**
   * Soumettre une révision de flashcard
   */
  async submitReview(userId, flashcardId, quality, timeSpent = 0) {
    // Valider quality (0-5)
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }
    
    // Récupérer la dernière révision
    const lastReview = await prisma.flashcardReview.findFirst({
      where: {
        userId,
        flashcardId
      },
      orderBy: {
        reviewedAt: 'desc'
      }
    });
    
    // Calculer avec SM-2
    const sm2Result = this.calculateSM2(
      quality,
      lastReview?.interval || 0,
      lastReview?.easeFactor || 2.5,
      lastReview?.repetitions || 0
    );
    
    // Créer la nouvelle révision
    const review = await prisma.flashcardReview.create({
      data: {
        userId,
        flashcardId,
        quality,
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        nextReview: sm2Result.nextReview,
        timeSpent
      },
      include: {
        flashcard: {
          include: {
            subject: true,
            lesson: true,
            chapter: true
          }
        }
      }
    });
    
    // Mettre à jour XP (+5 XP par révision)
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: 5 },
        level: { increment: 0 } // Recalculé côté dashboard
      }
    });
    
    return {
      review,
      sm2Result,
      xpGained: 5
    };
  }
  
  /**
   * Statistiques de révision pour un utilisateur
   */
  async getUserStats(userId) {
    const [totalReviews, totalFlashcards, dueCount] = await Promise.all([
      // Total de révisions effectuées
      prisma.flashcardReview.count({
        where: { userId }
      }),
      
      // Total de flashcards disponibles
      prisma.flashcard.count(),
      
      // Flashcards à réviser aujourd'hui
      prisma.flashcard.count({
        where: {
          reviews: {
            some: {
              userId,
              nextReview: {
                lte: new Date()
              }
            }
          }
        }
      })
    ]);
    
    // Flashcards jamais révisées
    const newCount = await prisma.flashcard.count({
      where: {
        reviews: {
          none: {
            userId
          }
        }
      }
    });
    
    // Calcul du taux de rétention
    const recentReviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        reviewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      }
    });
    
    const goodReviews = recentReviews.filter(r => r.quality >= 3).length;
    const retentionRate = recentReviews.length > 0 
      ? Math.round((goodReviews / recentReviews.length) * 100) 
      : 0;
    
    // Streak de révisions
    const streak = await this.calculateReviewStreak(userId);
    
    return {
      totalReviews,
      totalFlashcards,
      dueCount,
      newCount,
      retentionRate,
      streak,
      reviewedLast30Days: recentReviews.length
    };
  }
  
  /**
   * Calculer le streak de révisions
   */
  async calculateReviewStreak(userId) {
    const reviews = await prisma.flashcardReview.findMany({
      where: { userId },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: 'desc' }
    });
    
    if (reviews.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const review of reviews) {
      const reviewDate = new Date(review.reviewedAt);
      reviewDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - reviewDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Générer automatiquement des flashcards depuis une leçon
   */
  async generateFromLesson(lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });
    
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    // Pour l'instant, retourner un placeholder
    // TODO: Utiliser Gemini API pour extraire les concepts clés
    const flashcards = [];
    
    // Exemple de génération basique (à améliorer avec IA)
    const concepts = lesson.objectives || [];
    
    for (const concept of concepts) {
      const flashcard = await this.createFlashcard({
        question: `Qu'est-ce que ${concept} ?`,
        answer: `Concept clé de la leçon : ${lesson.title}`,
        explanation: `Voir leçon complète : ${lesson.title}`,
        subjectId: lesson.chapter.subjectId,
        chapterId: lesson.chapterId,
        lessonId: lesson.id,
        difficulty: 'FACILE',
        tags: [lesson.chapter.subject.slug, lesson.slug]
      });
      
      flashcards.push(flashcard);
    }
    
    return flashcards;
  }
}

export default new FlashcardsService();



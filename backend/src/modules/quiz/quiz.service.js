import prismaService from '../../database/prisma.js';
import badgesService from '../badges/badges.service.js';

const prisma = prismaService.client || prismaService;

class QuizService {
  
  // Récupérer tous les quiz disponibles
  async getAllQuizzes(filters = {}) {
    const { subjectSlug, level, difficulty } = filters;
    
    const where = { isActive: true };
    
    if (subjectSlug) {
      where.subject = { slug: subjectSlug };
    }
    
    if (level) {
      where.level = level;
    }
    
    if (difficulty) {
      where.difficulty = difficulty;
    }

    return await prisma.quiz.findMany({
      where,
      include: {
        subject: true,
        chapter: true,
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Récupérer un quiz avec ses questions
  async getQuizById(quizId) {
    return await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subject: true,
        chapter: true,
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  // Démarrer une tentative de quiz
  async startQuizAttempt(userId, quizId) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      throw new Error('Quiz non trouvé');
    }

    // Créer la tentative
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    // Retourner le quiz sans les réponses correctes
    const questionsWithoutAnswers = quiz.questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      order: q.order,
      points: q.points
    }));

    return {
      attempt,
      quiz: {
        ...quiz,
        questions: questionsWithoutAnswers
      }
    };
  }

  // Soumettre une tentative de quiz
  async submitQuizAttempt(attemptId, userId, answers) {
    // Récupérer la tentative
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      throw new Error('Tentative non trouvée');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new Error('Cette tentative est déjà terminée');
    }

    // Calculer le score
    let totalScore = 0;
    let correctAnswers = 0;
    const results = [];

    for (const question of attempt.quiz.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }

      results.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      });
    }

    const totalQuestions = attempt.quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= attempt.quiz.passingScore;

    // Calculer le temps passé
    const timeSpent = Math.floor((new Date() - new Date(attempt.startedAt)) / 1000);

    // Mettre à jour la tentative
    const completedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: totalScore,
        answers: answers,
        passed,
        timeSpent
      }
    });

    // Ajouter des XP si réussi
    let xpGained = 0;
    if (passed) {
      xpGained = Math.floor(totalScore * 1.5);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpGained }
        }
      });
    }

    // Vérifier les badges débloqués
    const newBadges = await badgesService.checkAndUnlockBadges(userId);

    return {
      attempt: {
        ...completedAttempt,
        xpGained
      },
      results,
      summary: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        totalScore,
        percentage,
        passed,
        passingScore: attempt.quiz.passingScore,
        xpGained
      },
      newBadges
    };
  }

  // Récupérer l'historique des tentatives d'un utilisateur
  async getUserAttempts(userId, limit = 10) {
    return await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            subject: true,
            chapter: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Récupérer les tentatives pour un quiz spécifique
  async getQuizAttempts(userId, quizId) {
    return await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Statistiques globales des quiz
  async getUserQuizStats(userId) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { 
        userId,
        status: 'COMPLETED'
      }
    });

    const total = attempts.length;
    const passed = attempts.filter(a => a.passed).length;
    const averageScore = total > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / total)
      : 0;

    return {
      totalAttempts: total,
      quizzesPassed: passed,
      quizzesFailed: total - passed,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      averageScore
    };
  }
}

export default new QuizService();

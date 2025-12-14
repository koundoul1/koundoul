import quizService from './quiz.service.js';

class QuizController {
  
  // GET /api/quiz
  async getQuizzes(req, res) {
    try {
      const { subject, level, difficulty } = req.query;
      
      const quizzes = await quizService.getAllQuizzes({
        subjectSlug: subject,
        level,
        difficulty
      });

      res.json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      console.error('❌ Get quizzes error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/quiz/:id
  async getQuiz(req, res) {
    try {
      const { id } = req.params;
      const quiz = await quizService.getQuizById(id);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: { message: 'Quiz non trouvé' }
        });
      }

      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('❌ Get quiz error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/quiz/:id/start
  async startQuiz(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || null; // Authentification optionnelle

      // Si pas d'utilisateur authentifié, permettre quand même de démarrer le quiz
      // mais sans sauvegarder la tentative
      if (!userId) {
        const quiz = await quizService.getQuizById(id);
        if (!quiz) {
          return res.status(404).json({
            success: false,
            error: { message: 'Quiz non trouvé' }
          });
        }
        return res.json({
          success: true,
          data: {
            quiz,
            attemptId: null,
            message: 'Mode invité : les résultats ne seront pas sauvegardés'
          },
          message: 'Quiz démarré en mode invité'
        });
      }

      const result = await quizService.startQuizAttempt(userId, id);

      res.json({
        success: true,
        data: result,
        message: 'Quiz démarré avec succès'
      });
    } catch (error) {
      console.error('❌ Start quiz error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/quiz/attempt/:attemptId/submit
  async submitQuiz(req, res) {
    try {
      const { attemptId } = req.params;
      const { answers, quizId } = req.body;
      const userId = req.user?.userId || null; // Authentification optionnelle

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          error: { message: 'Réponses invalides' }
        });
      }

      // Si pas d'utilisateur authentifié, calculer le score sans sauvegarder
      if (!userId || !attemptId) {
        const quiz = await quizService.getQuizById(quizId || attemptId);
        if (!quiz) {
          return res.status(404).json({
            success: false,
            error: { message: 'Quiz non trouvé' }
          });
        }

        // Calculer le score localement
        let correctCount = 0;
        let totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question, index) => {
          const userAnswer = answers[question.id] || answers[index];
          if (userAnswer === question.correctAnswer) {
            correctCount++;
          }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= quiz.passingScore || 70;

        return res.json({
          success: true,
          data: {
            summary: {
              score,
              correctAnswers: correctCount,
              totalQuestions,
              passed,
              message: passed 
                ? '🎉 Quiz réussi ! Félicitations !' 
                : 'Quiz terminé. Continue à t\'entraîner !'
            },
            answers: quiz.questions.map(q => ({
              questionId: q.id,
              correctAnswer: q.correctAnswer,
              userAnswer: answers[q.id] || answers[quiz.questions.indexOf(q)]
            }))
          },
          message: 'Mode invité : résultats non sauvegardés. Connectez-vous pour sauvegarder vos progrès !'
        });
      }

      const result = await quizService.submitQuizAttempt(attemptId, userId, answers);

      res.json({
        success: true,
        data: result,
        message: result.summary.passed 
          ? '🎉 Quiz réussi ! Félicitations !' 
          : 'Quiz terminé. Continue à t\'entraîner !'
      });
    } catch (error) {
      console.error('❌ Submit quiz error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/quiz/attempts
  async getUserAttempts(req, res) {
    try {
      const userId = req.user.userId;
      const { limit } = req.query;

      const attempts = await quizService.getUserAttempts(userId, limit ? parseInt(limit) : 10);

      res.json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error('❌ Get attempts error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/quiz/:id/attempts
  async getQuizAttempts(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const attempts = await quizService.getQuizAttempts(userId, id);

      res.json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error('❌ Get quiz attempts error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/quiz/stats
  async getQuizStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await quizService.getUserQuizStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Get quiz stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new QuizController();



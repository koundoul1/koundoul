import contentService from './content.service.js';

class ContentController {
  
  // GET /api/content/subjects
  async getSubjects(req, res) {
    try {
      const subjects = await contentService.getAllSubjects();
      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('❌ Get subjects error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/subjects/:slug
  async getSubject(req, res) {
    try {
      const { slug } = req.params;
      const subject = await contentService.getSubjectBySlug(slug);
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: { message: 'Matière non trouvée' }
        });
      }

      res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('❌ Get subject error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/subjects/:slug/chapters?level=SECONDE
  async getChapters(req, res) {
    try {
      const { slug } = req.params;
      const { level } = req.query;

      const chapters = await contentService.getChaptersByLevel(slug, level);
      
      res.json({
        success: true,
        data: chapters
      });
    } catch (error) {
      console.error('❌ Get chapters error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/subjects/:slug/chapters/:chapterSlug
  async getChapter(req, res) {
    try {
      const { slug, chapterSlug } = req.params;
      const chapter = await contentService.getChapterBySlug(slug, chapterSlug);
      
      if (!chapter) {
        return res.status(404).json({
          success: false,
          error: { message: 'Chapitre non trouvé' }
        });
      }

      res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('❌ Get chapter error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/lessons
  async getLessons(req, res) {
    try {
      const { subject, level, chapterId } = req.query;
      
      const lessons = await contentService.getLessons({ subject, level, chapterId });
      
      res.json({
        success: true,
        data: lessons
      });
    } catch (error) {
      console.error('❌ Get lessons error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/lessons/:lessonId
  async getLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const { chapterId } = req.query;

      // Si chapterId est fourni, chercher par slug dans le chapitre
      // Sinon, chercher directement par ID
      const lesson = chapterId 
        ? await contentService.getLessonBySlug(chapterId, lessonId)
        : await contentService.getLessonById(lessonId);
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: { message: 'Leçon non trouvée' }
        });
      }

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('❌ Get lesson error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/content/lessons/:lessonId/complete
  async completeLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const { timeSpent } = req.body;
      const userId = req.user?.userId || null; // Authentification optionnelle

      // Si pas d'utilisateur authentifié, permettre quand même de marquer comme complété
      // mais sans sauvegarder la progression
      if (!userId) {
        return res.json({
          success: true,
          data: {
            lessonId,
            completed: true,
            message: 'Mode invité : progression non sauvegardée'
          },
          message: 'Leçon complétée en mode invité. Connectez-vous pour sauvegarder votre progression !'
        });
      }

      const completion = await contentService.markLessonComplete(userId, lessonId, timeSpent || 0);

      res.json({
        success: true,
        data: completion,
        message: 'Leçon complétée !'
      });
    } catch (error) {
      console.error('❌ Complete lesson error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/exercises/:exerciseId
  async getExercise(req, res) {
    try {
      const { exerciseId } = req.params;
      const exercise = await contentService.getExerciseById(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: { message: 'Exercice non trouvé' }
        });
      }

      // Ne pas renvoyer la solution tant que l'utilisateur n'a pas soumis
      const { solution, steps, correctAnswer, ...exerciseWithoutSolution } = exercise;

      res.json({
        success: true,
        data: exerciseWithoutSolution
      });
    } catch (error) {
      console.error('❌ Get exercise error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/content/exercises/:exerciseId/submit
  async submitExercise(req, res) {
    try {
      const { exerciseId } = req.params;
      const { userAnswer, timeSpent, hintsUsed } = req.body;
      const userId = req.user?.userId || null; // Authentification optionnelle

      const exercise = await contentService.getExerciseById(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: { message: 'Exercice non trouvé' }
        });
      }

      // Vérifier si la réponse est correcte
      const isCorrect = userAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

      // Si pas d'utilisateur authentifié, renvoyer juste la correction sans sauvegarder
      if (!userId) {
        return res.json({
          success: true,
          data: {
            isCorrect,
            score: isCorrect ? 100 : 0,
            solution: exercise.solution,
            steps: exercise.steps,
            newBadges: []
          },
          message: isCorrect 
            ? 'Bravo ! Réponse correcte ! (Mode invité : résultat non sauvegardé)' 
            : 'Réponse incorrecte, consulte la solution. Connectez-vous pour sauvegarder vos progrès !'
        });
      }

      // Enregistrer la tentative
      const result = await contentService.submitExerciseAttempt(
        userId,
        exerciseId,
        userAnswer,
        isCorrect,
        timeSpent || 0,
        hintsUsed || 0
      );

      // Renvoyer la solution
      res.json({
        success: true,
        data: {
          isCorrect,
          score: result.attempt.score,
          solution: exercise.solution,
          steps: exercise.steps,
          newBadges: result.newBadges
        },
        message: isCorrect ? 'Bravo ! Réponse correcte !' : 'Réponse incorrecte, consulte la solution.'
      });
    } catch (error) {
      console.error('❌ Submit exercise error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/content/progress/chapter/:chapterId
  async getChapterProgress(req, res) {
    try {
      const { chapterId } = req.params;
      const userId = req.user.userId;

      const progress = await contentService.getUserChapterProgress(userId, chapterId);

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: { message: 'Chapitre non trouvé' }
        });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('❌ Get progress error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new ContentController();

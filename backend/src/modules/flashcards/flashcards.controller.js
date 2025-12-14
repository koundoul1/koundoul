import flashcardsService from './flashcards.service.js';

class FlashcardsController {
  
  // GET /flashcards - Liste des flashcards
  async getFlashcards(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        subjectId: req.query.subjectId,
        lessonId: req.query.lessonId,
        chapterId: req.query.chapterId,
        difficulty: req.query.difficulty,
        tags: req.query.tags ? req.query.tags.split(',') : undefined
      };
      
      const flashcards = await flashcardsService.getUserFlashcards(userId, filters);
      
      res.json({
        success: true,
        data: flashcards
      });
    } catch (error) {
      console.error('❌ Get flashcards error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // GET /flashcards/due - Flashcards à réviser
  async getDueFlashcards(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 20;
      
      const flashcards = await flashcardsService.getDueFlashcards(userId, limit);
      
      res.json({
        success: true,
        data: flashcards,
        count: flashcards.length
      });
    } catch (error) {
      console.error('❌ Get due flashcards error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /flashcards - Créer une flashcard
  async createFlashcard(req, res) {
    try {
      const { question, answer, explanation, subjectId, lessonId, chapterId, difficulty, tags } = req.body;
      
      if (!question || !answer || !subjectId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Question, answer et subjectId sont requis' }
        });
      }
      
      const flashcard = await flashcardsService.createFlashcard({
        question,
        answer,
        explanation,
        subjectId,
        lessonId,
        chapterId,
        difficulty,
        tags
      });
      
      res.json({
        success: true,
        data: flashcard,
        message: 'Flashcard créée avec succès'
      });
    } catch (error) {
      console.error('❌ Create flashcard error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /flashcards/:id/review - Soumettre une révision
  async submitReview(req, res) {
    try {
      const userId = req.user.userId;
      const flashcardId = req.params.id;
      const { quality, timeSpent } = req.body;
      
      if (quality === undefined || quality === null) {
        return res.status(400).json({
          success: false,
          error: { message: 'Quality est requis (0-5)' }
        });
      }
      
      const result = await flashcardsService.submitReview(
        userId,
        flashcardId,
        parseInt(quality),
        parseInt(timeSpent) || 0
      );
      
      res.json({
        success: true,
        data: result,
        message: `Révision enregistrée ! Prochaine révision dans ${result.sm2Result.interval} jour(s)`
      });
    } catch (error) {
      console.error('❌ Submit review error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // GET /flashcards/stats - Statistiques utilisateur
  async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await flashcardsService.getUserStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Get stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /flashcards/generate/:lessonId - Générer depuis une leçon
  async generateFromLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const flashcards = await flashcardsService.generateFromLesson(lessonId);
      
      res.json({
        success: true,
        data: flashcards,
        count: flashcards.length,
        message: `${flashcards.length} flashcard(s) générée(s)`
      });
    } catch (error) {
      console.error('❌ Generate flashcards error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new FlashcardsController();



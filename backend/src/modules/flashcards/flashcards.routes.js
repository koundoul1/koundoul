import express from 'express';
import flashcardsController from './flashcards.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /flashcards - Liste des flashcards (avec filtres)
router.get('/', flashcardsController.getFlashcards);

// GET /flashcards/due - Flashcards à réviser aujourd'hui
router.get('/due', flashcardsController.getDueFlashcards);

// GET /flashcards/stats - Statistiques utilisateur
router.get('/stats', flashcardsController.getStats);

// POST /flashcards - Créer une flashcard manuelle
router.post('/', flashcardsController.createFlashcard);

// POST /flashcards/:id/review - Soumettre une révision
router.post('/:id/review', flashcardsController.submitReview);

// POST /flashcards/generate/:lessonId - Générer depuis une leçon
router.post('/generate/:lessonId', flashcardsController.generateFromLesson);

export default router;



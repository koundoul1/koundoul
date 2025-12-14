import express from 'express';
import quizController from './quiz.controller.js';
import authenticateToken, { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuiz);

// Routes avec authentification optionnelle (permettent l'accès sans inscription)
router.post('/:id/start', optionalAuth, quizController.startQuiz);
router.post('/attempt/:attemptId/submit', optionalAuth, quizController.submitQuiz);

// Routes protégées (nécessitent authentification pour les fonctionnalités personnelles)
router.use(authenticateToken);

router.get('/attempts/history', quizController.getUserAttempts);
router.get('/:id/attempts', quizController.getQuizAttempts);
router.get('/stats/user', quizController.getQuizStats);

export default router;



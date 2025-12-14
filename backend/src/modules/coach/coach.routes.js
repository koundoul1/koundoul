/**
 * 🤖 Coach Virtuel Routes - KOUNDOUL
 * Routes pour les fonctionnalités du coach virtuel
 */

import express from 'express';
import coachController from './coach.controller.js';
import authenticateToken, { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.post('/analyze', optionalAuth, coachController.analyzeExercise);
router.post('/question', optionalAuth, coachController.generateNextQuestion);
router.post('/validate', optionalAuth, coachController.validateAnswer);
router.post('/complete', optionalAuth, coachController.completeSession);
router.get('/history', authenticateToken, coachController.getSessionHistory);
router.get('/stats', authenticateToken, coachController.getCoachStats);

// Routes pour le moteur d'étapes
router.post('/steps/start', optionalAuth, coachController.startStepSession);
router.post('/steps/validate', optionalAuth, coachController.validateStepAnswer);
router.post('/steps/hint', optionalAuth, coachController.getStepHint);
router.post('/steps/adapt', optionalAuth, coachController.adaptGuidance);
router.post('/steps/complete', optionalAuth, coachController.completeStepSession);

export default router;

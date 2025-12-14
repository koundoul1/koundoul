import express from 'express';
import solverController from './solver.controller.js';
import authenticateToken, { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// POST /solve - Résoudre un problème (authentification optionnelle)
router.post('/solve', optionalAuth, solverController.solve);

// Routes protégées nécessitant une authentification
router.use(authenticateToken);

// GET /history - Historique des problèmes
router.get('/history', solverController.getHistory);

// GET /problem/:id - Récupérer un problème spécifique
router.get('/problem/:id', solverController.getProblem);

export default router;

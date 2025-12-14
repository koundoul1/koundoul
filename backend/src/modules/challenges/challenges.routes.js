/**
 * 🏆 Routes Challenges - KOUNDOUL
 */

import express from 'express';
import challengesController from './challenges.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', challengesController.getChallenges.bind(challengesController));
router.get('/weekly', challengesController.getWeeklyChallenge.bind(challengesController));
router.get('/:id', challengesController.getChallenge.bind(challengesController));
router.get('/:id/leaderboard', challengesController.getLeaderboard.bind(challengesController));

// Routes protégées
router.use(authenticateToken);
router.post('/:id/start', challengesController.startChallenge.bind(challengesController));
router.post('/:id/submit', challengesController.submitChallenge.bind(challengesController));
router.get('/:id/rank', challengesController.getUserRank.bind(challengesController));

export default router;








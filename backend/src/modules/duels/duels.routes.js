/**
 * ⚔️ Routes Duels - KOUNDOUL
 */

import express from 'express';
import duelsController from './duels.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get('/', duelsController.getDuels.bind(duelsController));
router.get('/history', duelsController.getDuelHistory.bind(duelsController));
router.post('/', duelsController.createDuel.bind(duelsController));
router.post('/:id/accept', duelsController.acceptDuel.bind(duelsController));
router.post('/:id/start', duelsController.startDuel.bind(duelsController));
router.post('/:id/submit', duelsController.submitDuel.bind(duelsController));

export default router;








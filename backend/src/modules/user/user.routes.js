/**
 * 👤 Routes User - Koundoul
 * Routes pour le profil utilisateur et les statistiques
 */

import express from 'express';
import { getUserStats, generateInvitationCode, getProfile } from './user.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(requireAuth);

// Routes
router.get('/profile', getProfile);
router.get('/stats', getUserStats);
router.post('/generate-invitation-code', generateInvitationCode);

export default router;










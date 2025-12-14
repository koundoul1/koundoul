/**
 * 👤 Users Routes - KOUNDOUL
 * Routes pour les fonctionnalités utilisateur
 */

import express from 'express';
import usersController from './users.controller.js';

const router = express.Router();

// GET /api/users/profile - Récupérer le profil utilisateur
router.get('/profile', usersController.getProfile);

// PUT /api/users/profile - Mettre à jour le profil utilisateur
router.put('/profile', usersController.updateProfile);

export default router;
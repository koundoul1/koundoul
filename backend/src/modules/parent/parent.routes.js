/**
 * 👨‍👩‍👧‍👦 Routes Parent - Koundoul
 * Routes pour le dashboard parents
 */

import express from 'express';
import { getParentDashboard, getChildren, addChild } from './parent.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(requireAuth);

// Routes
router.get('/children', getChildren);
router.get('/dashboard/:childId', getParentDashboard);
router.post('/add-child', addChild);

export default router;










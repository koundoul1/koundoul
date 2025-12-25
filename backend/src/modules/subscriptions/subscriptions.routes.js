import express from 'express';
import subscriptionsController from './subscriptions.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes protégées (nécessitent authentification)
router.use(requireAuth);

// Obtenir tous les plans
router.get('/plans', subscriptionsController.getPlans.bind(subscriptionsController));

// Obtenir l'abonnement actif de l'utilisateur
router.get('/my-subscription', subscriptionsController.getMySubscription.bind(subscriptionsController));

// Obtenir l'historique des abonnements
router.get('/history', subscriptionsController.getHistory.bind(subscriptionsController));

// Créer un nouvel abonnement
router.post('/create', subscriptionsController.createSubscription.bind(subscriptionsController));

// Annuler un abonnement
router.post('/:id/cancel', subscriptionsController.cancelSubscription.bind(subscriptionsController));

export default router;

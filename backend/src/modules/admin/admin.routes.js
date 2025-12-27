import express from 'express';
import adminController from './admin.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes admin nécessitent l'authentification admin
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard admin
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// Gestion des utilisateurs
router.get('/users', adminController.getUsers.bind(adminController));
router.patch('/users/:id', adminController.updateUser.bind(adminController));

// Gestion des abonnements
router.get('/subscriptions', adminController.getSubscriptions.bind(adminController));

// Gestion des paiements
router.get('/payments', adminController.getPayments.bind(adminController));

// Gestion des plans d'abonnement
router.get('/plans', adminController.getPlans.bind(adminController));
router.post('/plans', adminController.createPlan.bind(adminController));
router.patch('/plans/:id', adminController.updatePlan.bind(adminController));
router.delete('/plans/:id', adminController.deletePlan.bind(adminController));

export default router;

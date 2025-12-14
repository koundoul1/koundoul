import express from 'express';
import dashboardController from './dashboard.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', dashboardController.getDashboard);

export default router;



import express from 'express';
import badgesController from './badges.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', badgesController.getUserBadges);
router.get('/all', badgesController.getAllBadges);
router.post('/check', badgesController.checkBadges);
router.get('/stats', badgesController.getBadgeStats);

export default router;



import express from 'express';
import forumController from './forum.controller.js';
import authenticateToken from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques (lecture)
router.get('/', forumController.getDiscussions);
router.get('/:id', forumController.getDiscussion);

// Routes protégées (écriture)
router.use(authenticateToken);

// Créer une discussion
router.post('/', forumController.createDiscussion);

// Ajouter une réponse
router.post('/:id/reply', forumController.createReply);

// Voter
router.post('/:id/vote', forumController.voteDiscussion);
router.post('/reply/:replyId/vote', forumController.voteReply);

// Marquer meilleure réponse
router.post('/:id/best-answer/:replyId', forumController.markBestAnswer);

// Discussions/réponses de l'utilisateur
router.get('/user/discussions', forumController.getUserDiscussions);
router.get('/user/replies', forumController.getUserReplies);

export default router;



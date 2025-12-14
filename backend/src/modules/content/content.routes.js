import express from 'express';
import contentController from './content.controller.js';
import authenticateToken, { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques (liste des matières et chapitres)
router.get('/subjects', contentController.getSubjects);
router.get('/subjects/:slug', contentController.getSubject);
router.get('/subjects/:slug/chapters', contentController.getChapters);
router.get('/subjects/:slug/chapters/:chapterSlug', contentController.getChapter);

// Route publique pour lister les leçons
router.get('/lessons', contentController.getLessons);

// Routes avec authentification optionnelle (permettent l'accès sans inscription)
router.get('/lessons/:lessonId', optionalAuth, contentController.getLesson);
router.post('/lessons/:lessonId/complete', optionalAuth, contentController.completeLesson);

router.get('/exercises/:exerciseId', optionalAuth, contentController.getExercise);
router.post('/exercises/:exerciseId/submit', optionalAuth, contentController.submitExercise);

// Routes protégées (nécessitent authentification pour les fonctionnalités personnelles)
router.use(authenticateToken);

router.get('/progress/chapter/:chapterId', contentController.getChapterProgress);

export default router;



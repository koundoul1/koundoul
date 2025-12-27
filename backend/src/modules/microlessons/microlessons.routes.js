import { Router } from 'express'
import controller from './microlessons.controller.js'
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware.js'

const router = Router()

// Liste + recherche
router.get('/', controller.list)

// Détail
router.get('/:id', controller.get)

// Parcours chapitre
router.get('/chapters/path', controller.chapterPath)

// ===== TRACKING ROUTES =====
// GET /completion est optionnel (peut être appelé sans auth, retournera null)
router.get('/:id/completion', optionalAuth, controller.getCompletion)
// Les autres routes nécessitent authentification
router.post('/:id/complete', requireAuth, controller.complete)
router.get('/stats/me', requireAuth, controller.myStats)
router.get('/reviews/to-review', requireAuth, controller.toReview)

export default router



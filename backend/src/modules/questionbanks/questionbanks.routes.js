import { Router } from 'express'
import controller from './questionbanks.controller.js'

const router = Router()

// Liste des banques
router.get('/', controller.list)

// Détail d'une banque
router.get('/:id', controller.getById)

// QCM d'une banque (avec filtres)
router.get('/:bankId/qcm', controller.getQCM)

// Exercices d'une banque (avec filtres)
router.get('/:bankId/exercises', controller.getExercises)

// QCM aléatoires
router.get('/:bankId/qcm/random', controller.getRandomQCM)

// Exercices aléatoires
router.get('/:bankId/exercises/random', controller.getRandomExercises)

export default router










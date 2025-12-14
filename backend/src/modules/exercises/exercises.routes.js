import { Router } from 'express'
import controller from './exercises.controller.js'

const router = Router()

router.get('/from-microlessons', controller.getFromMicrolessons)

export default router










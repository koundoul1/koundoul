import express from 'express'
import authController from './auth.controller.js'
import authenticateToken from '../../middlewares/auth.middleware.js'

const router = express.Router()

// 🔐 Routes publiques (sans authentification)
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.get('/check-email', authController.checkEmail)
router.get('/check-username', authController.checkUsername)

// 🔒 Routes protégées (avec authentification)
router.use(authenticateToken) // Middleware d'authentification pour toutes les routes suivantes

router.get('/profile', authController.getProfile)
router.put('/profile', authController.updateProfile)
router.put('/change-password', authController.changePassword)
router.delete('/account', authController.deleteAccount)

// 🔍 Route de test d'authentification
router.get('/verify', (req, res) => {
  res.json({
    success: true,
    message: 'Token valide',
    data: {
      user: req.user,
      timestamp: new Date().toISOString()
    }
  })
})

export default router

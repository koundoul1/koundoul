import authService from './auth.service.js'
import { logger } from '../../utils/logger.js'

class AuthController {
  // 🔐 Inscription
  async register(req, res) {
    try {
      const { email, username, password, firstName, lastName } = req.body

      // Validation des données
      if (!email || !username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, nom d\'utilisateur et mot de passe sont requis'
          }
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le mot de passe doit contenir au moins 6 caractères'
          }
        })
      }

      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
          }
        })
      }

      // Vérifier le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Format d\'email invalide'
          }
        })
      }

      const result = await authService.register({
        email,
        username,
        password,
        firstName,
        lastName
      })

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        data: result
      })
    } catch (error) {
      logger.error('Erreur dans register controller:', error)
      
      if (error.message.includes('existe déjà') || error.message.includes('déjà pris')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: error.message
          }
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔑 Connexion
  async login(req, res) {
    try {
      console.log('🔍 Login attempt:', { email: req.body.email });
      
      const { email, password } = req.body

      // Validation des données
      if (!email || !password) {
        console.log('❌ Validation failed: missing email or password');
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email et mot de passe sont requis'
          }
        })
      }

      console.log('🔑 Calling authService.login...');
      const result = await authService.login({ email, password })
      console.log('✅ Login successful:', { userId: result.user.id, email: result.user.email });

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result
      })
    } catch (error) {
      console.error('❌ Login error:', error.message);
      console.error('Stack:', error.stack);
      logger.error('Erreur dans login controller:', error)
      
      if (error.message.includes('incorrect') || error.message.includes('désactivé')) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: error.message
          }
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔄 Rafraîchir le token
  async refreshToken(req, res) {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token requis'
          }
        })
      }

      const result = await authService.refreshToken(token)

      res.json({
        success: true,
        message: 'Token rafraîchi avec succès',
        data: result
      })
    } catch (error) {
      logger.error('Erreur dans refreshToken controller:', error)
      
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Token invalide'
        }
      })
    }
  }

  // 🔐 Changer le mot de passe
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user.id

      // Validation des données
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Mot de passe actuel et nouveau mot de passe sont requis'
          }
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
          }
        })
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword)

      res.json({
        success: true,
        message: result.message,
        data: result
      })
    } catch (error) {
      logger.error('Erreur dans changePassword controller:', error)
      
      if (error.message.includes('incorrect')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔍 Obtenir le profil
  async getProfile(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Utilisateur non authentifié'
          }
        })
      }
      
      const profile = await authService.getProfile(userId)

      res.json({
        success: true,
        data: profile
      })
    } catch (error) {
      logger.error('Erreur dans getProfile controller:', error)
      
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔄 Mettre à jour le profil
  async updateProfile(req, res) {
    try {
      const userId = req.user.id
      const { firstName, lastName, avatar } = req.body

      const updateData = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (lastName !== undefined) updateData.lastName = lastName
      if (avatar !== undefined) updateData.avatar = avatar

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Aucune donnée à mettre à jour'
          }
        })
      }

      const updatedProfile = await authService.updateProfile(userId, updateData)

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedProfile
      })
    } catch (error) {
      logger.error('Erreur dans updateProfile controller:', error)
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🗑️ Supprimer le compte
  async deleteAccount(req, res) {
    try {
      const { password } = req.body
      const userId = req.user.id

      if (!password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Mot de passe requis pour supprimer le compte'
          }
        })
      }

      const result = await authService.deleteAccount(userId, password)

      res.json({
        success: true,
        message: result.message,
        data: result
      })
    } catch (error) {
      logger.error('Erreur dans deleteAccount controller:', error)
      
      if (error.message.includes('incorrect')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        })
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔍 Vérifier la disponibilité d'un email
  async checkEmail(req, res) {
    try {
      const { email } = req.query

      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email requis'
          }
        })
      }

      const exists = await authService.emailExists(email)

      res.json({
        success: true,
        data: {
          email,
          available: !exists
        }
      })
    } catch (error) {
      logger.error('Erreur dans checkEmail controller:', error)
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }

  // 🔍 Vérifier la disponibilité d'un nom d'utilisateur
  async checkUsername(req, res) {
    try {
      const { username } = req.query

      if (!username) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nom d\'utilisateur requis'
          }
        })
      }

      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
          }
        })
      }

      const exists = await authService.usernameExists(username)

      res.json({
        success: true,
        data: {
          username,
          available: !exists
        }
      })
    } catch (error) {
      logger.error('Erreur dans checkUsername controller:', error)
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur interne du serveur'
        }
      })
    }
  }
}

export default new AuthController()

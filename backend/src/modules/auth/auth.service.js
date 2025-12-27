import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import prismaService from '../../database/prisma.js'
import { logger } from '../../utils/logger.js'

class AuthService {
  constructor() {
    this.prisma = prismaService.client
    this.jwtSecret = process.env.JWT_SECRET
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    
    // Vérifier que JWT_SECRET est configuré
    if (!this.jwtSecret) {
      logger.error('❌ JWT_SECRET n\'est pas défini dans les variables d\'environnement')
      throw new Error('JWT_SECRET n\'est pas configuré. Veuillez définir JWT_SECRET dans les variables d\'environnement.')
    }
  }

  // 🔐 Inscription d'un nouvel utilisateur
  async register(userData) {
    try {
      const { email, username, password, firstName, lastName } = userData

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      })

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new Error('Un utilisateur avec cet email existe déjà')
        }
        if (existingUser.username === username.toLowerCase()) {
          throw new Error('Ce nom d\'utilisateur est déjà pris')
        }
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, this.bcryptRounds)

      // Créer l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
          xp: 0,
          level: 1,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          xp: true,
          level: true,
          createdAt: true
        }
      })

      // Générer le token JWT
      const token = this.generateToken(user.id)

      logger.info(`Nouvel utilisateur inscrit: ${user.email}`)

      return {
        user,
        token
      }
    } catch (error) {
      logger.error('Erreur lors de l\'inscription:', error)
      throw error
    }
  }

  // 🔑 Connexion d'un utilisateur
  async login(credentials) {
    try {
      const { email, password } = credentials

      // Vérifier si c'est une tentative de connexion parent avec code d'invitation
      // Si le password ressemble à un code d'invitation (6 caractères alphanumériques majuscules)
      const isInvitationCode = /^[A-Z0-9]{6}$/.test(password)
      
      if (isInvitationCode) {
        return await this.loginWithInvitationCode(email, password)
      }

      // Trouver l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: {
          email: email.toLowerCase()
        },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          firstName: true,
          lastName: true,
          xp: true,
          level: true,
          isActive: true,
          isAdmin: true,
          createdAt: true
        }
      })

      if (!user) {
        throw new Error('Email ou mot de passe incorrect')
      }

      if (!user.isActive) {
        throw new Error('Compte désactivé')
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect')
      }

      // Générer le token JWT
      const token = this.generateToken(user.id)

      // Mettre à jour la dernière connexion
      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      })

      logger.info(`Utilisateur connecté: ${user.email}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: user.xp,
          level: user.level,
          isAdmin: user.isAdmin || false,
          createdAt: user.createdAt
        },
        token
      }
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error)
      throw error
    }
  }

  // 👨‍👩‍👧‍👦 Connexion parent avec email enfant + code d'invitation
  async loginWithInvitationCode(childEmail, invitationCode) {
    try {
      // Trouver l'enfant avec cet email et ce code d'invitation
      const child = await this.prisma.user.findFirst({
        where: {
          email: childEmail.toLowerCase(),
          invitationCode: invitationCode.toUpperCase()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          invitationCode: true,
          isActive: true
        }
      })

      if (!child) {
        throw new Error('Email ou code d\'invitation incorrect')
      }

      if (!child.isActive) {
        throw new Error('Compte enfant désactivé')
      }

      // Chercher ou créer un compte parent pour cet enfant
      // On crée un compte parent avec un email unique basé sur l'enfant
      const parentEmail = `parent.${child.id}@koundoul.local`
      
      let parent = await this.prisma.user.findFirst({
        where: {
          email: parentEmail
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      })

      // Si le parent n'existe pas, le créer
      if (!parent) {
        // Générer un mot de passe aléatoire (ne sera jamais utilisé directement)
        const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), this.bcryptRounds)
        
        parent = await this.prisma.user.create({
          data: {
            email: parentEmail,
            username: `parent_${child.id}`,
            password: randomPassword,
            firstName: child.firstName ? `Parent de ${child.firstName}` : 'Parent',
            lastName: child.lastName || '',
            isActive: true
          },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            createdAt: true
          }
        })

        logger.info(`Compte parent créé automatiquement: ${parentEmail}`)
      }

      // Vérifier si le lien parent-enfant existe, sinon le créer
      const existingLink = await this.prisma.parentChildLink.findUnique({
        where: {
          parentId_childId: {
            parentId: parent.id,
            childId: child.id
          }
        }
      })

      if (!existingLink) {
        await this.prisma.parentChildLink.create({
          data: {
            parentId: parent.id,
            childId: child.id,
            approved: true
          }
        })
        logger.info(`Lien parent-enfant créé: parent ${parent.id} -> enfant ${child.id}`)
      }

      // Générer le token JWT avec l'ID du parent
      const token = this.generateToken(parent.id)

      logger.info(`Parent connecté avec code invitation: ${parentEmail} (enfant: ${child.email})`)

      return {
        user: {
          id: parent.id,
          email: parent.email,
          username: parent.username,
          firstName: parent.firstName,
          lastName: parent.lastName,
          xp: 0,
          level: 1,
          isAdmin: false,
          createdAt: parent.createdAt,
          isParent: true,
          childId: child.id,
          childEmail: child.email,
          childName: `${child.firstName || ''} ${child.lastName || ''}`.trim() || child.email
        },
        token
      }
    } catch (error) {
      logger.error('Erreur lors de la connexion parent avec code invitation:', error)
      throw error
    }
  }

  // 🔍 Vérifier un token JWT
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret)
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          xp: true,
          level: true,
          isActive: true,
          isAdmin: true,
          createdAt: true
        }
      })

      if (!user || !user.isActive) {
        throw new Error('Token invalide ou utilisateur inactif')
      }

      return user
    } catch (error) {
      logger.error('Erreur lors de la vérification du token:', error)
      throw new Error('Token invalide')
    }
  }

  // 🔄 Rafraîchir un token
  async refreshToken(token) {
    try {
      const user = await this.verifyToken(token)
      const newToken = this.generateToken(user.id)
      
      return {
        user,
        token: newToken
      }
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token:', error)
      throw error
    }
  }

  // 🔐 Changer le mot de passe
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      // Vérifier l'ancien mot de passe
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        throw new Error('Mot de passe actuel incorrect')
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, this.bcryptRounds)

      // Mettre à jour le mot de passe
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      })

      logger.info(`Mot de passe changé pour l'utilisateur: ${user.email}`)

      return { message: 'Mot de passe changé avec succès' }
    } catch (error) {
      logger.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }

  // 🔍 Obtenir le profil utilisateur
  async getProfile(userId) {
    try {
      const user = await prismaService.findUserWithStats(userId)
      
      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      return user
    } catch (error) {
      logger.error('Erreur lors de la récupération du profil:', error)
      throw error
    }
  }

  // 🔄 Mettre à jour le profil
  async updateProfile(userId, updateData) {
    try {
      const { firstName, lastName, avatar } = updateData

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(avatar && { avatar }),
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          xp: true,
          level: true,
          updatedAt: true
        }
      })

      logger.info(`Profil mis à jour pour l'utilisateur: ${user.email}`)

      return user
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  // 🗑️ Supprimer un compte
  async deleteAccount(userId, password) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect')
      }

      // Désactiver le compte au lieu de le supprimer
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          isActive: false,
          email: `deleted_${Date.now()}_${user.email}`,
          username: `deleted_${Date.now()}_${user.username}`,
          updatedAt: new Date()
        }
      })

      logger.info(`Compte supprimé pour l'utilisateur: ${user.email}`)

      return { message: 'Compte supprimé avec succès' }
    } catch (error) {
      logger.error('Erreur lors de la suppression du compte:', error)
      throw error
    }
  }

  // 🔧 Méthodes utilitaires
  generateToken(userId) {
    if (!this.jwtSecret) {
      logger.error('❌ JWT_SECRET n\'est pas défini lors de la génération du token')
      throw new Error('JWT_SECRET n\'est pas configuré')
    }
    
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    )
  }

  // Vérifier si un email existe
  async emailExists(email) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    return !!user
  }

  // Vérifier si un nom d'utilisateur existe
  async usernameExists(username) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    })
    return !!user
  }
}

export default new AuthService()


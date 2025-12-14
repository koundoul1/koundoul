import { logger } from '../utils/logger.js'

class ErrorMiddleware {
  // 🚨 Middleware de gestion d'erreurs global
  handleError(error, req, res, next) {
    // Log de l'erreur
    logger.error('Unhandled Error', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    })

    // Erreurs Prisma
    if (error.code && error.code.startsWith('P')) {
      return this.handlePrismaError(error, res)
    }

    // Erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token invalide'
        }
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expiré'
        }
      })
    }

    // Erreurs de validation
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details
        }
      })
    }

    // Erreurs de syntaxe JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Format JSON invalide'
        }
      })
    }

    // Erreurs de limite de taille
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Fichier trop volumineux'
        }
      })
    }

    // Erreurs de limite de requêtes
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes, veuillez réessayer plus tard'
        }
      })
    }

    // Erreur par défaut
    const statusCode = error.statusCode || error.status || 500
    const message = process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : error.message

    res.status(statusCode).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error
        })
      }
    })
  }

  // 🗄️ Gestion des erreurs Prisma
  handlePrismaError(error, res) {
    switch (error.code) {
      case 'P2002':
        // Violation de contrainte unique
        const field = error.meta?.target?.[0] || 'champ'
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: `Ce ${field} existe déjà`,
            field
          }
        })

      case 'P2025':
        // Enregistrement non trouvé
        return res.status(404).json({
          success: false,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: 'Enregistrement non trouvé'
          }
        })

      case 'P2003':
        // Violation de clé étrangère
        return res.status(400).json({
          success: false,
          error: {
            code: 'FOREIGN_KEY_CONSTRAINT',
            message: 'Violation de contrainte de clé étrangère'
          }
        })

      case 'P2014':
        // Violation de contrainte de relation
        return res.status(400).json({
          success: false,
          error: {
            code: 'RELATION_CONSTRAINT',
            message: 'Violation de contrainte de relation'
          }
        })

      case 'P1001':
        // Impossible de se connecter à la base de données
        return res.status(503).json({
          success: false,
          error: {
            code: 'DATABASE_CONNECTION_ERROR',
            message: 'Impossible de se connecter à la base de données'
          }
        })

      case 'P1008':
        // Timeout de la base de données
        return res.status(504).json({
          success: false,
          error: {
            code: 'DATABASE_TIMEOUT',
            message: 'Timeout de la base de données'
          }
        })

      default:
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Erreur de base de données',
            ...(process.env.NODE_ENV === 'development' && {
              prismaCode: error.code,
              details: error.message
            })
          }
        })
    }
  }

  // 🚫 Middleware pour les routes non trouvées
  handleNotFound(req, res) {
    logger.warn('Route Not Found', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} non trouvée`
      }
    })
  }

  // 🔒 Middleware pour les erreurs d'autorisation
  handleUnauthorized(req, res) {
    logger.warn('Unauthorized Access', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Accès non autorisé'
      }
    })
  }

  // 🚫 Middleware pour les erreurs d'accès interdit
  handleForbidden(req, res) {
    logger.warn('Forbidden Access', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    })

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès interdit'
      }
    })
  }

  // ⚠️ Middleware pour les erreurs de validation
  handleValidationError(error, req, res, next) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données de validation invalides',
          details: error.details
        }
      })
    }
    next(error)
  }

  // 🔄 Middleware pour les erreurs asynchrones
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

export default new ErrorMiddleware()


import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import des middlewares
import errorMiddleware from './middlewares/error.middleware.js'
import { httpLogger } from './utils/logger.js'

// Import des routes
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import solverRoutes from './modules/solver/solver.routes.js'
import contentRoutes from './modules/content/content.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import quizRoutes from './modules/quiz/quiz.routes.js'
import microlessonsRoutes from './modules/microlessons/microlessons.routes.js'
import badgesRoutes from './modules/badges/badges.routes.js'
import flashcardsRoutes from './modules/flashcards/flashcards.routes.js'
import forumRoutes from './modules/forum/forum.routes.js'
import constantsRoutes from './routes/constants.js'
import coachRoutes from './modules/coach/coach.routes.js'
import exercisesRoutes from './modules/exercises/exercises.routes.js'
import questionbanksRoutes from './modules/questionbanks/questionbanks.routes.js'
import userRoutes from './modules/user/user.routes.js'
import parentRoutes from './modules/parent/parent.routes.js'
import challengesRoutes from './modules/challenges/challenges.routes.js'
import duelsRoutes from './modules/duels/duels.routes.js'

// Import du service Prisma
import prismaService from './database/prisma.js'

// Charger les variables d'environnement
dotenv.config()

class App {
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3001
    this.setupMiddlewares()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  // 🔧 Configuration des middlewares
  setupMiddlewares() {
    // Sécurité
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }))

    // CORS - Configuration permissive pour le développement
    this.app.use(cors({
      origin: (origin, callback) => {
        // En développement, autoriser toutes les origines localhost
        if (process.env.NODE_ENV === 'development') {
          if (!origin || origin.includes('localhost')) {
            callback(null, true)
          } else {
            callback(new Error('Accès non autorisé par la politique CORS.'))
          }
        } else {
          // En production, utiliser la liste des origines autorisées
          const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [
            'http://localhost:3000', // React (port principal)
            'http://localhost:5173', // Vite (port alternatif)
            'http://localhost:3002', // Vite (port alternatif)
          ]
          
          // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
          if (!origin) {
            return callback(null, true)
          }
          
          // Vérifier si l'origine correspond exactement ou via pattern
          const isAllowed = allowedOrigins.some(allowed => {
            // Support des wildcards pour Vercel preview URLs (ex: *.vercel.app)
            if (allowed.includes('*')) {
              const pattern = '^' + allowed.replace(/\*/g, '.*') + '$'
              return new RegExp(pattern).test(origin)
            }
            // Correspondance exacte
            return origin === allowed || origin.startsWith(allowed)
          })
          
          if (isAllowed) {
            callback(null, true)
          } else {
            console.error(`❌ CORS Refusé: Tentative d'accès depuis ${origin}`)
            console.error(`   Origines autorisées: ${allowedOrigins.join(', ')}`)
            callback(new Error('Accès non autorisé par la politique CORS.'))
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }))

    // Limitation du taux de requêtes
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes par fenêtre
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes, veuillez réessayer plus tard'
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    })
    this.app.use(limiter)

    // Logging des requêtes HTTP
    this.app.use(httpLogger)

    // Parser JSON
    this.app.use(express.json({ 
      limit: '10mb'
    }))

    // Parser URL-encoded
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }))

    // Logging avec Morgan
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'))
    } else {
      this.app.use(morgan('combined'))
    }

    // Middleware pour ajouter des headers de sécurité
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      next()
    })
  }

  // 🛣️ Configuration des routes
  setupRoutes() {
    // Route de santé
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await prismaService.healthCheck()
        
        res.json({
          success: true,
          message: 'Serveur en cours d\'exécution',
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: dbHealth.status,
            version: process.env.npm_package_version || '1.0.0'
          }
        })
      } catch (error) {
        res.status(503).json({
          success: false,
          message: 'Serveur en panne',
          data: {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
          }
        })
      }
    })

    // Route racine
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '🚀 API Koundoul - Plateforme de Résolution de Problèmes Scientifiques',
        data: {
          version: '1.0.0',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            auth: '/api/auth',
            docs: '/api/docs'
          }
        }
      })
    })

    // Routes API
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/users', usersRoutes)
    this.app.use('/api/user', userRoutes)
    this.app.use('/api/parent', parentRoutes)
    this.app.use('/api/solver', solverRoutes)
    this.app.use('/api/content', contentRoutes)
    this.app.use('/api/dashboard', dashboardRoutes)
    this.app.use('/api/quiz', quizRoutes)
    this.app.use('/api/microlessons', microlessonsRoutes)
    this.app.use('/api/badges', badgesRoutes)
    this.app.use('/api/flashcards', flashcardsRoutes)
    this.app.use('/api/forum', forumRoutes)
    this.app.use('/api/constants', constantsRoutes)
    this.app.use('/api/coach', coachRoutes)
    this.app.use('/api/exercises', exercisesRoutes)
    this.app.use('/api/question-banks', questionbanksRoutes)
    this.app.use('/api/challenges', challengesRoutes)
    this.app.use('/api/duels', duelsRoutes)

    // Route de documentation API
    this.app.get('/api/docs', (req, res) => {
      res.json({
        success: true,
        message: 'Documentation API Koundoul',
        data: {
          version: '1.0.0',
          baseUrl: `${req.protocol}://${req.get('host')}/api`,
          endpoints: {
            auth: {
              register: 'POST /auth/register',
              login: 'POST /auth/login',
              profile: 'GET /auth/profile',
              refreshToken: 'POST /auth/refresh-token',
              changePassword: 'PUT /auth/change-password',
              deleteAccount: 'DELETE /auth/account'
            },
            health: 'GET /health'
          },
          authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>'
          }
        }
      })
    })

    // Route pour les méthodes non supportées
    this.app.use('*', (req, res) => {
      res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Méthode ${req.method} non autorisée pour ${req.originalUrl}`
        }
      })
    })
  }

  // 🚨 Configuration de la gestion d'erreurs
  setupErrorHandling() {
    // Middleware pour les routes non trouvées
    this.app.use(errorMiddleware.handleNotFound)

    // Middleware de gestion d'erreurs global
    this.app.use(errorMiddleware.handleError)

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })

    // Gestion de l'arrêt gracieux
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM reçu, arrêt du serveur...')
      await this.gracefulShutdown()
    })

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT reçu, arrêt du serveur...')
      await this.gracefulShutdown()
    })
  }

  // 🔌 Connexion à la base de données
  async connectDatabase() {
    try {
      await prismaService.connect()
      console.log('✅ Base de données connectée')
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error)
      process.exit(1)
    }
  }

  // 🚀 Démarrage du serveur
  async start() {
    try {
      // Connexion à la base de données
      await this.connectDatabase()

      // Démarrage du serveur
      // Utiliser '0.0.0.0' pour permettre les connexions externes (nécessaire pour Render)
      const host = process.env.HOST || '0.0.0.0'
      this.server = this.app.listen(this.port, host, () => {
        console.log(`
🚀 Serveur Koundoul démarré !
📍 Port: ${this.port}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${this.port}
📚 API Docs: http://${host === '0.0.0.0' ? 'localhost' : host}:${this.port}/api/docs
❤️  Health: http://${host === '0.0.0.0' ? 'localhost' : host}:${this.port}/health
        `)
      })

      // Configuration du timeout du serveur (augmenté pour les appels IA Gemini)
      this.server.timeout = 120000 // 2 minutes pour permettre les appels IA longs

    } catch (error) {
      console.error('❌ Erreur lors du démarrage du serveur:', error)
      process.exit(1)
    }
  }

  // 🛑 Arrêt gracieux du serveur
  async gracefulShutdown() {
    try {
      console.log('🔄 Arrêt gracieux en cours...')
      
      if (this.server) {
        this.server.close(async () => {
          console.log('🔌 Serveur HTTP fermé')
          
          // Fermeture de la connexion à la base de données
          await prismaService.disconnect()
          console.log('🔌 Base de données déconnectée')
          
          process.exit(0)
        })
      } else {
        await prismaService.disconnect()
        process.exit(0)
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt gracieux:', error)
      process.exit(1)
    }
  }
}

export default App

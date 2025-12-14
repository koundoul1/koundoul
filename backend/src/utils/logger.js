import winston from 'winston'
import path from 'path'

// Configuration des niveaux de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

// Configuration des couleurs pour les logs
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(logColors)

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Format pour la console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return log
  })
)

// Configuration des transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  })
]

// Ajouter le transport fichier en production
if (process.env.NODE_ENV === 'production') {
  // Créer le dossier logs s'il n'existe pas
  const logsDir = path.join(process.cwd(), 'logs')
  
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
}

// Créer l'instance Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false
})

// Fonction pour logger les requêtes HTTP
export const httpLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else {
      logger.http('HTTP Request', logData)
    }
  })

  next()
}

// Fonction pour logger les erreurs
export const errorLogger = (error, req, res, next) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  })

  next(error)
}

// Fonction pour logger les événements métier
export const businessLogger = {
  userRegistration: (userData) => {
    logger.info('User Registration', {
      event: 'user_registration',
      email: userData.email,
      username: userData.username,
      timestamp: new Date().toISOString()
    })
  },

  userLogin: (userData) => {
    logger.info('User Login', {
      event: 'user_login',
      userId: userData.id,
      email: userData.email,
      timestamp: new Date().toISOString()
    })
  },

  problemSolved: (userId, problemId, points) => {
    logger.info('Problem Solved', {
      event: 'problem_solved',
      userId,
      problemId,
      points,
      timestamp: new Date().toISOString()
    })
  },

  quizCompleted: (userId, quizId, score) => {
    logger.info('Quiz Completed', {
      event: 'quiz_completed',
      userId,
      quizId,
      score,
      timestamp: new Date().toISOString()
    })
  },

  paymentProcessed: (userId, amount, currency) => {
    logger.info('Payment Processed', {
      event: 'payment_processed',
      userId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    })
  }
}

// Fonction pour logger les performances
export const performanceLogger = {
  databaseQuery: (query, duration) => {
    if (duration > 1000) { // Log seulement les requêtes lentes
      logger.warn('Slow Database Query', {
        query,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      })
    }
  },

  apiResponse: (endpoint, duration, statusCode) => {
    if (duration > 2000) { // Log seulement les réponses lentes
      logger.warn('Slow API Response', {
        endpoint,
        duration: `${duration}ms`,
        statusCode,
        timestamp: new Date().toISOString()
      })
    }
  }
}

export { logger }
export default logger



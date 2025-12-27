import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Configuration de l'environnement
const config = {
  // 🌐 Serveur
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // 🗄️ Base de données
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000
  },

  // 🔐 Authentification JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'koundoul-default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // 🔒 Sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb'
  },

  // 🤖 Google AI (Gemini)
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
    maxTokens: parseInt(process.env.GOOGLE_AI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.GOOGLE_AI_TEMPERATURE) || 0.7
  },

  // 💳 Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.CURRENCY || 'eur'
  },

  // 📧 Email (Optionnel)
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@koundoul.com'
  },

  // 📊 Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '5m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // 🎯 Gamification
  gamification: {
    defaultXpProblem: parseInt(process.env.DEFAULT_XP_PROBLEM) || 10,
    defaultXpQuiz: parseInt(process.env.DEFAULT_XP_QUIZ) || 20,
    defaultXpBadge: parseInt(process.env.DEFAULT_XP_BADGE) || 50,
    levelUpThreshold: parseInt(process.env.LEVEL_UP_THRESHOLD) || 100,
    maxLevel: parseInt(process.env.MAX_LEVEL) || 100
  },

  // 💰 Paiements
  payments: {
    currency: process.env.CURRENCY || 'eur',
    minAmount: parseInt(process.env.MIN_PAYMENT_AMOUNT) || 100, // en centimes
    maxAmount: parseInt(process.env.MAX_PAYMENT_AMOUNT) || 100000, // en centimes
    webhookTolerance: parseInt(process.env.STRIPE_WEBHOOK_TOLERANCE) || 300 // 5 minutes
  },

  // 🔧 Développement
  development: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    enableHelmet: process.env.ENABLE_HELMET !== 'false'
  }
}

// Validation des variables requises
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET'
]

const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '))
  console.error('💡 Créez un fichier .env basé sur env.example')
  process.exit(1)
}

// Validation des variables optionnelles mais importantes
const warnings = []

if (!process.env.GOOGLE_AI_API_KEY) {
  warnings.push('GOOGLE_AI_API_KEY - L\'IA ne fonctionnera pas')
}

if (!process.env.STRIPE_SECRET_KEY) {
  warnings.push('STRIPE_SECRET_KEY - Les paiements ne fonctionneront pas')
}

if (warnings.length > 0) {
  console.warn('⚠️  Avertissements de configuration:')
  warnings.forEach(warning => console.warn(`   - ${warning}`))
}

// Fonction pour obtenir une configuration
export const getConfig = (key) => {
  const keys = key.split('.')
  let value = config
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value
}

// Fonction pour vérifier si on est en production
export const isProduction = () => config.nodeEnv === 'production'

// Fonction pour vérifier si on est en développement
export const isDevelopment = () => config.nodeEnv === 'development'

// Fonction pour obtenir l'URL de base
export const getBaseUrl = () => {
  const port = config.port
  const protocol = isProduction() ? 'https' : 'http'
  const host = isProduction() ? process.env.HOST || 'localhost' : 'localhost'
  return `${protocol}://${host}:${port}`
}

export default config


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initPlans } = require('./scripts/initPlans');
const { seedFlashcards } = require('./scripts/seedFlashcards');
const prisma = require('./config/database');

// ── Fail-fast: required environment variables ──
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('❌ FATAL: JWT_SECRET is missing or too short (minimum 32 characters).');
  console.error('   Set a strong random secret in your .env file.');
  console.error('   Example: JWT_SECRET=$(openssl rand -hex 32)');
  process.exit(1);
}

// AI features: graceful degradation if key missing
if (!process.env.GOOGLE_AI_API_KEY) {
  console.warn('⚠️  GOOGLE_AI_API_KEY not set — AI features (Solver, Coach) will return 503');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Fonction pour vérifier l'état des migrations
async function checkMigrationsStatus() {
  try {
    // Vérifier si la table _prisma_migrations existe
    const migrationsTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;

    if (!migrationsTable[0].exists) {
      console.log('⚠️  ATTENTION: La table _prisma_migrations n\'existe pas.');
      console.log('📝 Les migrations n\'ont PAS été exécutées.');
      console.log('💡 Exécutez: npx prisma migrate deploy\n');
      return { migrated: false, message: 'Migrations not executed' };
    }

    // Vérifier les migrations appliquées
    const appliedMigrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY finished_at DESC
      LIMIT 5;
    `;

    if (appliedMigrations.length === 0) {
      console.log('⚠️  Aucune migration trouvée dans la base de données.');
      console.log('💡 Exécutez: npx prisma migrate deploy\n');
      return { migrated: false, message: 'No migrations found' };
    }

    console.log('✅ Migrations Prisma vérifiées:');
    appliedMigrations.forEach((migration, index) => {
      console.log(`   ${index + 1}. ${migration.migration_name} (${migration.finished_at})`);
    });

    // Vérifier les tables principales
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `;

    console.log(`📊 Tables créées: ${tables.length}`);
    console.log('✅ Base de données prête!\n');
    
    return { 
      migrated: true, 
      migrations: appliedMigrations,
      tablesCount: tables.length,
      tables: tables.map(t => t.table_name)
    };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des migrations:');
    console.error(error.message);
    
    if (error.message.includes('does not exist') || 
        error.message.includes('relation') || 
        error.message.includes('table')) {
      console.log('⚠️  La base de données semble vide ou non configurée.');
      console.log('💡 Exécutez: npx prisma migrate deploy\n');
    }
    
    return { migrated: false, error: error.message };
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Liste des origines autorisées
    const allowedOrigins = [
      'https://www.koundoul.com',
      'https://koundoul.com',
      'https://koundoul-frontend.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002'
    ];
    
    // En développement ou si pas d'origine (ex: Postman), autoriser
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === origin) {
      callback(null, true);
    } else {
      // Si FRONTEND_URL est défini et correspond, autoriser
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(morgan('combined'));

// IMPORTANT: Raw body pour le webhook Wave (AVANT express.json)
// Nécessaire pour vérifier la signature HMAC
app.use('/api/payments/wave/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Koundoul Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Migration status check
app.get('/api/migrations/status', async (req, res) => {
  try {
    const status = await checkMigrationsStatus();
    res.json({
      status: 'ok',
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const badgesRoutes = require('./routes/badges');
const flashcardsRoutes = require('./routes/flashcards');
const quizRoutes = require('./routes/quiz');
const questionBanksRoutes = require('./routes/questionBanks');
const challengesRoutes = require('./routes/challenges');
const duelsRoutes = require('./routes/duels');
const solverRoutes = require('./routes/solver');
const forumRoutes = require('./routes/forum');
const microlessonsRoutes = require('./routes/microlessons');
const coachRoutes = require('./routes/coach');
const usersRoutes = require('./routes/users');
const subscriptionsRoutes = require('./routes/subscriptions');
const paymentsRoutes = require('./routes/payments');
const parentRoutes = require('./routes/parent');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const errorHandler = require('./middlewares/errorHandler');

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Koundoul Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      migrations: '/api/migrations/status',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      badges: '/api/badges',
      flashcards: '/api/flashcards',
      quiz: '/api/quiz',
      challenges: '/api/challenges',
      solver: '/api/solver',
      forum: '/api/forum',
      microlessons: '/api/microlessons',
      coach: '/api/coach',
      users: '/api/users'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/question-banks', questionBanksRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/duels', duelsRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/ai-quota', require('./routes/aiQuota'));
app.use('/api/forum', forumRoutes);
app.use('/api/microlessons', microlessonsRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);

const exercisesRoutes = require('./routes/exercises');
app.use('/api/content/exercises', exercisesRoutes);

const contentRoutes = require('./routes/content');
app.use('/api/content', contentRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Koundoul Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Migration status: http://localhost:${PORT}/api/migrations/status`);
  console.log('');
  
  // Vérifier l'état des migrations au démarrage
  const migrationStatus = await checkMigrationsStatus();
  
  // Initialiser les plans d'abonnement si les migrations sont OK
  if (migrationStatus.migrated) {
    try {
      await initPlans();
      console.log('Plans d\'abonnement initialises');
    } catch (error) {
      console.error('Erreur init plans:', error.message);
    }

    // Seed flashcards (idempotent)
    try {
      await seedFlashcards();
      console.log('Flashcards officielles initialisees');
    } catch (error) {
      console.error('Erreur seed flashcards:', error.message);
    }

    // Setup weekly challenge cron + startup catch-up
    try {
      const { setupWeeklyChallengeJob } = require('./jobs/weeklyChallengeJob');
      setupWeeklyChallengeJob();
    } catch (error) {
      console.error('Erreur cron weekly challenges:', error.message);
    }

    // Setup duel cleanup cron (expire stale duels every 5 min)
    try {
      const { setupDuelCleanupJob } = require('./jobs/duelCleanupJob');
      setupDuelCleanupJob();
    } catch (error) {
      console.error('Erreur cron duel cleanup:', error.message);
    }

    // Setup parent alerts cron (daily at 18h UTC)
    try {
      const { setupParentAlertsJob } = require('./jobs/parentAlertsJob');
      setupParentAlertsJob();
    } catch (error) {
      console.error('Erreur cron parent alerts:', error.message);
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

module.exports = app;

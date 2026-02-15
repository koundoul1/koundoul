require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
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
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('combined'));
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
app.use('/api/forum', forumRoutes);
app.use('/api/microlessons', microlessonsRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/parent', parentRoutes);

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
  await checkMigrationsStatus();
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

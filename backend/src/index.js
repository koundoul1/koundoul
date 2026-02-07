require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

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
const errorHandler = require('./middlewares/errorHandler');

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Koundoul Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
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
const server = app.listen(PORT, () => {
  console.log(`🚀 Koundoul Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
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

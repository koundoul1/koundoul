#!/usr/bin/env node

/**
 * 🧪 Test simple du serveur Koundoul
 * Teste le serveur sans Prisma pour vérifier que tout fonctionne
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Configuration
const app = express()
const port = 3001

// Middlewares
app.use(helmet())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Routes de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API Koundoul - Mode Test Simple',
    data: {
      version: '1.0.0',
      environment: 'test',
      timestamp: new Date().toISOString(),
      status: 'running'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur en cours d\'exécution',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'test'
    }
  })
})

// Route de test d'authentification
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route d\'authentification accessible',
    data: {
      method: 'POST',
      endpoint: '/api/auth/test',
      timestamp: new Date().toISOString()
    }
  })
})

// Démarrer le serveur
app.listen(port, () => {
  console.log(`
🧪 Serveur de test Koundoul démarré !
📍 Port: ${port}
🌍 Environnement: test
🔗 URL: http://localhost:${port}
❤️  Health: http://localhost:${port}/health
📝 Test Auth: POST http://localhost:${port}/api/auth/test
  `)
})

// Arrêt gracieux
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur de test...')
  process.exit(0)
})

export default app



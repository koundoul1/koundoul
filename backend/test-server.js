#!/usr/bin/env node

/**
 * 🧪 Script de test pour le serveur Koundoul
 * 
 * Ce script teste le serveur sans base de données
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Configuration minimale pour les tests
process.env.NODE_ENV = 'test'
process.env.PORT = '5001'
process.env.JWT_SECRET = 'test-secret-key'
process.env.CORS_ORIGIN = 'http://localhost:3000'

const app = express()

// Middlewares de base
app.use(helmet())
app.use(cors())
app.use(express.json())

// Route de test
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur de test en cours d\'exécution',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'test'
    }
  })
})

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API Koundoul - Mode Test',
    data: {
      version: '1.0.0',
      environment: 'test',
      timestamp: new Date().toISOString()
    }
  })
})

// Démarrer le serveur de test
const port = process.env.PORT || 5001
const server = app.listen(port, () => {
  console.log(`
🧪 Serveur de test Koundoul démarré !
📍 Port: ${port}
🔗 URL: http://localhost:${port}
❤️  Health: http://localhost:${port}/health
  `)
})

// Arrêt gracieux
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur de test...')
  server.close(() => {
    console.log('✅ Serveur de test arrêté')
    process.exit(0)
  })
})

export default app



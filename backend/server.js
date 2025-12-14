#!/usr/bin/env node

/**
 * 🚀 Serveur Koundoul - Point d'entrée principal
 * 
 * Ce fichier démarre le serveur Express avec toutes les configurations
 * et gère les connexions à la base de données.
 */

import App from './src/app.js'

// Créer une instance de l'application
const app = new App()

// Démarrer le serveur
app.start().catch((error) => {
  console.error('❌ Erreur fatale lors du démarrage:', error)
  process.exit(1)
})

// Export pour les tests
export default app



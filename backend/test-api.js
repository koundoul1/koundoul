#!/usr/bin/env node

/**
 * 🧪 Script de test pour l'API Koundoul
 */

const baseUrl = 'http://localhost:3001'

async function testAPI() {
  console.log('🧪 Test de l\'API Koundoul...\n')

  try {
    // Test 1: Route racine
    console.log('1️⃣ Test de la route racine...')
    const response1 = await fetch(`${baseUrl}/`)
    const data1 = await response1.json()
    console.log('✅ Route racine:', data1.message)
    console.log('')

    // Test 2: Health check
    console.log('2️⃣ Test du health check...')
    const response2 = await fetch(`${baseUrl}/health`)
    const data2 = await response2.json()
    console.log('✅ Health check:', data2.message)
    console.log('   Status:', data2.data.status)
    console.log('   Database:', data2.data.database)
    console.log('')

    // Test 3: Documentation API
    console.log('3️⃣ Test de la documentation API...')
    const response3 = await fetch(`${baseUrl}/api/docs`)
    const data3 = await response3.json()
    console.log('✅ Documentation API:', data3.message)
    console.log('   Endpoints disponibles:', Object.keys(data3.data.endpoints))
    console.log('')

    // Test 4: Inscription (sans charset)
    console.log('4️⃣ Test d\'inscription...')
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    }

    const response4 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const data4 = await response4.json()
    
    if (data4.success) {
      console.log('✅ Inscription réussie:', data4.message)
      console.log('   Utilisateur créé:', data4.data.user.email)
    } else {
      console.log('⚠️  Erreur d\'inscription:', data4.error.message)
      if (data4.error.message.includes('existe déjà')) {
        console.log('   (Normal si l\'utilisateur existe déjà)')
      }
    }
    console.log('')

    // Test 5: Connexion
    console.log('5️⃣ Test de connexion...')
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const response5 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })

    const data5 = await response5.json()
    
    if (data5.success) {
      console.log('✅ Connexion réussie:', data5.message)
      console.log('   Token généré:', data5.data.token ? 'Oui' : 'Non')
      console.log('   Utilisateur:', data5.data.user.email)
    } else {
      console.log('❌ Erreur de connexion:', data5.error.message)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }

  console.log('\n🎉 Tests terminés !')
}

// Exécuter les tests
testAPI()



#!/usr/bin/env node

/**
 * 🧪 Script pour tester le login directement
 * Teste la connexion avec le compte d'essai
 */

import bcrypt from 'bcryptjs'
import prismaService from './src/database/prisma.js'

const TEST_CREDENTIALS = {
  email: 'test@koundoul.com',
  password: 'Test123456!'
}

async function testLogin() {
  try {
    console.log('🔗 Connexion à la base de données...')
    await prismaService.connect()
    console.log('✅ Connecté à la base de données\n')

    // Trouver l'utilisateur
    console.log(`🔍 Recherche de l'utilisateur: ${TEST_CREDENTIALS.email}`)
    const user = await prismaService.client.user.findUnique({
      where: {
        email: TEST_CREDENTIALS.email.toLowerCase()
      }
    })

    if (!user) {
      console.error('❌ Utilisateur non trouvé !')
      console.log('\n💡 Créer le compte avec:')
      console.log('   node create-test-account.js')
      return
    }

    console.log('✅ Utilisateur trouvé:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Active: ${user.isActive}\n`)

    // Vérifier le mot de passe
    console.log('🔐 Vérification du mot de passe...')
    const isPasswordValid = await bcrypt.compare(TEST_CREDENTIALS.password, user.password)

    if (!isPasswordValid) {
      console.error('❌ Mot de passe incorrect !')
      console.log('\n💡 Recréer le compte avec:')
      console.log('   node create-test-account.js')
      return
    }

    console.log('✅ Mot de passe valide !\n')
    console.log('🎉 Le login devrait fonctionner !')
    console.log('\n📋 Identifiants:')
    console.log(`   Email: ${TEST_CREDENTIALS.email}`)
    console.log(`   Password: ${TEST_CREDENTIALS.password}`)

  } catch (error) {
    console.error('\n❌ Erreur lors du test:')
    console.error(error.message)
    
    if (error.message.includes('school')) {
      console.error('\n⚠️  Erreur: La colonne "school" n\'existe pas')
      console.error('💡 Solution: Render doit redéployer avec le commit be2762a')
      console.error('   → Render Dashboard → Manual Deploy → Clear cache & deploy')
    }
    
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prismaService.disconnect()
  }
}

// Exécuter le test
testLogin()

#!/usr/bin/env node

/**
 * 🧪 Script pour créer un compte d'essai
 * Crée un utilisateur de test directement dans la base de données
 */

import bcrypt from 'bcryptjs'
import prismaService from './src/database/prisma.js'

const TEST_USER = {
  email: 'test@koundoul.com',
  username: 'testuser',
  password: 'Test123456!',
  firstName: 'Test',
  lastName: 'User'
}

async function createTestAccount() {
  try {
    console.log('🔗 Connexion à la base de données...')
    await prismaService.connect()
    console.log('✅ Connecté à la base de données\n')

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prismaService.client.user.findFirst({
      where: {
        OR: [
          { email: TEST_USER.email },
          { username: TEST_USER.username }
        ]
      }
    })

    if (existingUser) {
      console.log('⚠️  Un utilisateur existe déjà avec ces identifiants :')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Username: ${existingUser.username}`)
      console.log('\n📋 Identifiants existants :')
      console.log(`   Email: ${TEST_USER.email}`)
      console.log(`   Username: ${TEST_USER.username}`)
      console.log(`   Password: ${TEST_USER.password}`)
      return
    }

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...')
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12)

    // Créer l'utilisateur
    console.log('👤 Création de l\'utilisateur...')
    const user = await prismaService.client.user.create({
      data: {
        email: TEST_USER.email.toLowerCase(),
        username: TEST_USER.username.toLowerCase(),
        password: hashedPassword,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
        xp: 0,
        level: 1,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        xp: true,
        level: true,
        createdAt: true
      }
    })

    console.log('\n✅ Compte d\'essai créé avec succès !\n')
    console.log('📋 Identifiants de connexion :')
    console.log('─'.repeat(50))
    console.log(`   Email    : ${user.email}`)
    console.log(`   Username : ${user.username}`)
    console.log(`   Password : ${TEST_USER.password}`)
    console.log('─'.repeat(50))
    console.log('\n📊 Informations du compte :')
    console.log(`   ID       : ${user.id}`)
    console.log(`   Nom      : ${user.firstName} ${user.lastName}`)
    console.log(`   XP       : ${user.xp}`)
    console.log(`   Level    : ${user.level}`)
    console.log(`   Créé le  : ${user.createdAt.toLocaleString('fr-FR')}`)
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec ces identifiants !')

  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte :')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prismaService.disconnect()
  }
}

// Exécuter le script
createTestAccount()

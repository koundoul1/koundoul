/**
 * Script pour créer un utilisateur administrateur
 * Usage: node scripts/create-admin-user.js
 */

import bcrypt from 'bcryptjs'
import prismaService from '../src/database/prisma.js'

const ADMIN_EMAIL = 'contact@peak-performance-partner.com'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'Admin123!' // ⚠️ Changez ce mot de passe après la première connexion
const ADMIN_FIRST_NAME = 'Admin'
const ADMIN_LAST_NAME = 'Koundoul'

async function createAdminUser() {
  try {
    console.log('🔧 Création de l\'utilisateur administrateur...')
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prismaService.client.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })

    if (existingUser) {
      console.log('✅ Utilisateur existe déjà. Promotion en admin...')
      
      // Promouvoir l'utilisateur existant en admin
      const updatedUser = await prismaService.client.user.update({
        where: { email: ADMIN_EMAIL },
        data: { isAdmin: true }
      })
      
      console.log('✅ Utilisateur promu administrateur avec succès!')
      console.log('📧 Email:', updatedUser.email)
      console.log('👤 Username:', updatedUser.username)
      console.log('🔑 isAdmin:', updatedUser.isAdmin)
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    
    // Créer l'utilisateur admin
    const user = await prismaService.client.user.create({
      data: {
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        isAdmin: true,
        isActive: true,
        xp: 0,
        level: 1
      }
    })

    console.log('✅ Utilisateur administrateur créé avec succès!')
    console.log('📧 Email:', user.email)
    console.log('👤 Username:', user.username)
    console.log('🔑 isAdmin:', user.isAdmin)
    console.log('')
    console.log('⚠️  IMPORTANT: Connectez-vous et changez le mot de passe immédiatement!')
    console.log('🔑 Mot de passe temporaire:', ADMIN_PASSWORD)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error)
    process.exit(1)
  } finally {
    await prismaService.disconnect()
  }
}

createAdminUser()

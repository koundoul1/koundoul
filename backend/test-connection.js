import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres"

console.log('🔍 Test de connexion à la base de données...')
console.log('URL:', DATABASE_URL.replace(/:[^:]*@/, ':***@'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function test() {
  try {
    console.log('\n⏳ Tentative de connexion...')
    await prisma.$connect()
    console.log('✅ CONNEXION RÉUSSIE !')
    
    const count = await prisma.user.count()
    console.log(`✅ ${count} utilisateur(s) trouvé(s)`)
    
    await prisma.$disconnect()
    console.log('✅ Déconnexion OK')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message)
    console.error('Code:', error.code)
    process.exit(1)
  }
}

test()










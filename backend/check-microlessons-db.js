import prismaService from './src/database/prisma.js'
import { getSupabasePool } from './src/database/supabasePg.js'

async function checkMicrolessons() {
  try {
    console.log('🔍 Vérification de la base de données...\n')
    
    // Vérifier la connexion Prisma
    console.log('1️⃣ Test connexion Prisma...')
    await prismaService.client.$queryRaw`SELECT 1`
    console.log('✅ Prisma connecté\n')
    
    // Vérifier la connexion Supabase
    console.log('2️⃣ Test connexion Supabase...')
    const supa = getSupabasePool()
    if (!supa) {
      console.log('⚠️ Pool Supabase non disponible, utilisation de Prisma uniquement\n')
    } else {
      await supa.query('SELECT 1')
      console.log('✅ Supabase connecté\n')
    }
    
    // Compter les leçons dans la table microlessons
    console.log('3️⃣ Comptage des microlessons...')
    let count = 0
    try {
      if (supa) {
        const result = await supa.query('SELECT COUNT(*) as count FROM public.microlessons')
        count = parseInt(result.rows[0].count, 10)
      } else {
        const result = await prismaService.client.$queryRawUnsafe(
          'SELECT COUNT(*) as count FROM public.microlessons'
        )
        count = parseInt(result[0].count, 10)
      }
      console.log(`📊 Nombre de microlessons dans la BD: ${count}\n`)
    } catch (error) {
      console.error('❌ Erreur lors du comptage:', error.message)
      console.log('⚠️ La table microlessons n\'existe peut-être pas ou n\'est pas accessible\n')
    }
    
    // Afficher quelques exemples
    if (count > 0) {
      console.log('4️⃣ Exemples de microlessons (5 premières)...')
      try {
        let rows = []
        if (supa) {
          const result = await supa.query(
            'SELECT id, title, subject, level, chapter FROM public.microlessons ORDER BY id LIMIT 5'
          )
          rows = result.rows
        } else {
          rows = await prismaService.client.$queryRawUnsafe(
            'SELECT id, title, subject, level, chapter FROM public.microlessons ORDER BY id LIMIT 5'
          )
        }
        
        rows.forEach(lesson => {
          console.log(`   - ${lesson.id}: ${lesson.title} (${lesson.subject}, ${lesson.level})`)
        })
        console.log('')
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des exemples:', error.message)
      }
    }
    
    // Test de la requête avec filtre subject
    console.log('5️⃣ Test requête avec filtre subject=Chimie...')
    try {
      let rows = []
      if (supa) {
        const result = await supa.query(
          'SELECT COUNT(*) as count FROM public.microlessons WHERE subject = $1',
          ['Chimie']
        )
        rows = result.rows
      } else {
        rows = await prismaService.client.$queryRawUnsafe(
          'SELECT COUNT(*) as count FROM public.microlessons WHERE subject = $1',
          'Chimie'
        )
      }
      const chimieCount = parseInt(rows[0]?.count || 0, 10)
      console.log(`   📊 Leçons de Chimie: ${chimieCount}\n`)
    } catch (error) {
      console.error('❌ Erreur lors du test de filtre:', error.message)
    }
    
    // Vérifier les matières disponibles
    console.log('6️⃣ Matières disponibles...')
    try {
      let rows = []
      if (supa) {
        const result = await supa.query(
          'SELECT DISTINCT subject, COUNT(*) as count FROM public.microlessons GROUP BY subject ORDER BY subject'
        )
        rows = result.rows
      } else {
        rows = await prismaService.client.$queryRawUnsafe(
          'SELECT DISTINCT subject, COUNT(*) as count FROM public.microlessons GROUP BY subject ORDER BY subject'
        )
      }
      
      if (rows.length > 0) {
        rows.forEach(row => {
          console.log(`   - ${row.subject}: ${row.count} leçons`)
        })
      } else {
        console.log('   ⚠️ Aucune matière trouvée')
      }
      console.log('')
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des matières:', error.message)
    }
    
    console.log('✅ Vérification terminée')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  } finally {
    await prismaService.client.$disconnect()
    process.exit(0)
  }
}

checkMicrolessons()









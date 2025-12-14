import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant. Configurez .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function importMicrolessons() {
  console.log('🚀 Début de l\'importation des micro-leçons...')

  try {
    const jsonPath = path.resolve(process.cwd(), 'data', 'all_450_microlessons.json')
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Fichier introuvable:', jsonPath)
      process.exit(1)
    }

    console.log('📖 Lecture du fichier JSON...')
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    const lessons = data.lessons || []
    console.log(`✅ ${lessons.length} leçons chargées`)

    console.log('🗑️  Suppression des anciennes données...')
    const { error: delErr } = await supabase.from('microlessons').delete().neq('id', '')
    if (delErr) console.warn('⚠️  Suppression: ', delErr.message)
    else console.log('✅ Anciennes données supprimées')

    const BATCH_SIZE = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < lessons.length; i += BATCH_SIZE) {
      const batch = lessons.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(lessons.length / BATCH_SIZE)
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length})`)

      const { error: insErr } = await supabase.from('microlessons').insert(batch)
      if (insErr) {
        console.error(`❌ Erreur batch ${batchNum}:`, insErr.message)
        errorCount += batch.length
      } else {
        console.log(`✅ Batch ${batchNum} OK`)
        successCount += batch.length
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 RÉSUMÉ')
    console.log('='.repeat(50))
    console.log(`✅ Succès: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`📈 Total: ${lessons.length}`)

    const { count, error: countError } = await supabase
      .from('microlessons')
      .select('*', { count: 'exact', head: true })

    if (countError) console.error('❌ Vérification:', countError.message)
    else console.log(`✅ ${count} leçons en base`)

    console.log('🎉 Import terminé!')
  } catch (err) {
    console.error('💥 Erreur critique:', err)
    process.exit(1)
  }
}

importMicrolessons()











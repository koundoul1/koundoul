/**
 * Script de test pour vérifier la configuration Supabase Storage
 * Usage: npx tsx scripts/test-supabase-upload.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes !')
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpload() {
  console.log('🧪 Test d\'upload Supabase Storage\n')
  
  // 1. Vérifier la connexion
  console.log('1️⃣ Vérification de la connexion...')
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw error
    
    console.log('✅ Connexion réussie')
    console.log(`   Buckets disponibles: ${data.map(b => b.name).join(', ')}\n`)
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message)
    return false
  }
  
  // 2. Vérifier que le bucket existe
  console.log('2️⃣ Vérification du bucket "sites-html"...')
  try {
    const { data, error } = await supabase.storage.from('sites-html').list()
    if (error) {
      if (error.message.includes('not found')) {
        console.error('❌ Le bucket "sites-html" n\'existe pas !')
        console.error('   Créez-le dans Supabase Dashboard → Storage')
        return false
      }
      throw error
    }
    
    console.log('✅ Bucket "sites-html" trouvé')
    console.log(`   Fichiers existants: ${data.length}\n`)
  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    return false
  }
  
  // 3. Test d'upload
  console.log('3️⃣ Test d\'upload d\'un fichier HTML...')
  const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Test Upload</title>
</head>
<body>
    <h1>✅ Test réussi !</h1>
    <p>Ce fichier a été uploadé via Supabase Storage.</p>
</body>
</html>`
  
  const testFilename = `test-${Date.now()}.html`
  
  try {
    const blob = new Blob([testHTML], { type: 'text/html' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sites-html')
      .upload(testFilename, blob, {
        contentType: 'text/html',
        upsert: true
      })
    
    if (uploadError) throw uploadError
    
    console.log('✅ Upload réussi !')
    console.log(`   Fichier: ${testFilename}\n`)
    
    // 4. Récupérer l'URL publique
    console.log('4️⃣ Récupération de l\'URL publique...')
    const { data: { publicUrl } } = supabase.storage
      .from('sites-html')
      .getPublicUrl(testFilename)
    
    console.log('✅ URL publique générée:')
    console.log(`   ${publicUrl}\n`)
    
    // 5. Nettoyer (optionnel)
    console.log('5️⃣ Nettoyage du fichier de test...')
    const { error: deleteError } = await supabase.storage
      .from('sites-html')
      .remove([testFilename])
    
    if (deleteError) {
      console.warn('⚠️  Impossible de supprimer le fichier de test:', deleteError.message)
    } else {
      console.log('✅ Fichier de test supprimé\n')
    }
    
    console.log('🎉 Tous les tests sont passés !')
    console.log('\n📝 Prochaines étapes:')
    console.log('   1. Utilisez l\'application Next.js pour uploader vos fichiers HTML')
    console.log('   2. Les fichiers seront accessibles via les URLs Supabase Storage')
    
    return true
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'upload:', error.message)
    
    if (error.message.includes('row-level security')) {
      console.error('\n💡 Solution:')
      console.error('   Le bucket n\'a pas les bonnes permissions.')
      console.error('   Créez les politiques SQL dans Supabase Dashboard → Storage → Policies')
    }
    
    return false
  }
}

// Exécuter le test
testUpload()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })

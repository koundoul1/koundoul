/**
 * Script pour uploader directement un fichier HTML vers Supabase Storage
 * Usage: node scripts/upload-file-direct.js "chemin/vers/fichier.html" "PK-4358"
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger les variables d'environnement depuis .env.local ou process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnbkplyerizogmufatxb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante !')
  console.error('Définissez-la dans .env.local ou comme variable d\'environnement')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadFile(filePath, numeroDossier) {
  console.log('📤 Upload de fichier HTML vers Supabase Storage\n')
  console.log(`Fichier: ${filePath}`)
  console.log(`Numéro dossier: ${numeroDossier}\n`)
  
  // 1. Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Le fichier n'existe pas: ${filePath}`)
    process.exit(1)
  }
  
  // 2. Lire le fichier
  console.log('📖 Lecture du fichier...')
  const htmlContent = fs.readFileSync(filePath, 'utf-8')
  console.log(`✅ Fichier lu (${(htmlContent.length / 1024).toFixed(2)} KB)\n`)
  
  // 3. Vérifier que c'est du HTML
  if (!htmlContent.includes('<html') && !htmlContent.includes('<!DOCTYPE')) {
    console.warn('⚠️  Le fichier ne semble pas contenir de HTML valide')
    console.warn('   Upload continuera quand même...\n')
  }
  
  // 4. Upload vers Supabase
  console.log('⬆️  Upload vers Supabase Storage...')
  const filename = `${numeroDossier}.html`
  
  try {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sites-html')
      .upload(filename, blob, {
        contentType: 'text/html',
        upsert: true // Écraser si existe déjà
      })
    
    if (uploadError) {
      if (uploadError.message.includes('not found')) {
        console.error('❌ Le bucket "sites-html" n\'existe pas !')
        console.error('   Créez-le dans Supabase Dashboard → Storage')
        console.error('   Voir GUIDE_SUPABASE_STORAGE.md pour les instructions')
      } else if (uploadError.message.includes('row-level security')) {
        console.error('❌ Erreur de permissions (row-level security)')
        console.error('   Créez les politiques SQL dans Supabase Dashboard')
        console.error('   Voir GUIDE_SUPABASE_STORAGE.md pour les instructions')
      } else {
        throw uploadError
      }
      process.exit(1)
    }
    
    console.log('✅ Upload réussi !\n')
    
    // 5. Récupérer l'URL publique
    console.log('🔗 Génération de l\'URL publique...')
    const { data: { publicUrl } } = supabase.storage
      .from('sites-html')
      .getPublicUrl(filename)
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCÈS ! Site mis en ligne')
    console.log('='.repeat(60))
    console.log(`\n📄 Fichier: ${filename}`)
    console.log(`🌐 URL publique:`)
    console.log(`   ${publicUrl}\n`)
    console.log('💡 Vous pouvez maintenant ouvrir cette URL dans votre navigateur')
    console.log('='.repeat(60) + '\n')
    
    return publicUrl
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error.message)
    process.exit(1)
  }
}

// Récupérer les arguments
const filePath = process.argv[2]
const numeroDossier = process.argv[3] || 'PK-4358'

if (!filePath) {
  console.error('Usage: node scripts/upload-file-direct.js "chemin/fichier.html" [numeroDossier]')
  console.error('\nExemple:')
  console.error('  node scripts/upload-file-direct.js "C:\\Users\\conta\\peak-1000\\Fichiers Html\\PK-4358-DER-DESIGN.html" "PK-4358"')
  process.exit(1)
}

// Exécuter l'upload
uploadFile(filePath, numeroDossier)
  .then(() => {
    console.log('✅ Terminé !')
  })
  .catch(error => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })

/**
 * Script pour uploader directement un fichier HTML vers Supabase Storage
 * Usage: node scripts/upload-file-direct.cjs "chemin/vers/fichier.html" "PK-4358"
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Charger les variables d'environnement depuis .env.local ou process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnbkplyerizogmufatxb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante !')
  console.error('Définissez-la dans .env.local ou comme variable d\'environnement')
  console.error('\nPour récupérer la clé:')
  console.error('1. Allez sur https://supabase.com/dashboard')
  console.error('2. Sélectionnez votre projet')
  console.error('3. Settings → API → Copiez "anon public" key')
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
  const fileSizeKB = (htmlContent.length / 1024).toFixed(2)
  console.log(`✅ Fichier lu (${fileSizeKB} KB)\n`)
  
  // 3. Vérifier que c'est du HTML
  if (!htmlContent.includes('<html') && !htmlContent.includes('<!DOCTYPE')) {
    console.warn('⚠️  Le fichier ne semble pas contenir de HTML valide')
    console.warn('   Upload continuera quand même...\n')
  }
  
  // 4. Upload vers Supabase
  console.log('⬆️  Upload vers Supabase Storage...')
  const filename = `${numeroDossier}.html`
  
  try {
    // Convertir le contenu en Buffer pour l'upload
    const buffer = Buffer.from(htmlContent, 'utf-8')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sites-html')
      .upload(filename, buffer, {
        contentType: 'text/html',
        upsert: true // Écraser si existe déjà
      })
    
    if (uploadError) {
      if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
        console.error('\n❌ Le bucket "sites-html" n\'existe pas !')
        console.error('\n📝 Solution:')
        console.error('1. Allez sur https://supabase.com/dashboard')
        console.error('2. Storage → New bucket')
        console.error('3. Nom: sites-html')
        console.error('4. ✅ Public bucket → Create')
        console.error('\nVoir GUIDE_SUPABASE_STORAGE.md pour plus de détails')
      } else if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        console.error('\n❌ Erreur de permissions (row-level security)')
        console.error('\n📝 Solution:')
        console.error('Exécutez ce SQL dans Supabase SQL Editor:')
        console.error(`
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'sites-html');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sites-html');
        `)
      } else {
        console.error('\n❌ Erreur:', uploadError.message)
      }
      process.exit(1)
    }
    
    console.log('✅ Upload réussi !\n')
    
    // 5. Récupérer l'URL publique
    console.log('🔗 Génération de l\'URL publique...')
    const { data: { publicUrl } } = supabase.storage
      .from('sites-html')
      .getPublicUrl(filename)
    
    console.log('\n' + '='.repeat(70))
    console.log('🎉 SUCCÈS ! Site mis en ligne')
    console.log('='.repeat(70))
    console.log(`\n📄 Fichier: ${filename}`)
    console.log(`📊 Taille: ${fileSizeKB} KB`)
    console.log(`🌐 URL publique:`)
    console.log(`\n   ${publicUrl}\n`)
    console.log('💡 Vous pouvez maintenant ouvrir cette URL dans votre navigateur')
    console.log('='.repeat(70) + '\n')
    
    return publicUrl
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'upload:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Récupérer les arguments
const filePath = process.argv[2]
const numeroDossier = process.argv[3] || 'PK-4358'

if (!filePath) {
  console.error('Usage: node scripts/upload-file-direct.cjs "chemin/fichier.html" [numeroDossier]')
  console.error('\nExemple:')
  console.error('  node scripts/upload-file-direct.cjs "C:\\Users\\conta\\peak-1000\\Fichiers Html\\PK-4358-DER-DESIGN.html" "PK-4358"')
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

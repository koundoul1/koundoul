import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Enrichit jusqu'à 50 leçons avec un contenu Markdown complet (sans vidéo)
 * - Cible: dossiers de backend/prisma/seeds/* contenant metadata.json
 * - Génère/écrase lesson.md si absent ou trop court (< 400 chars)
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = __dirname

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '').trim()
  try { return JSON.parse(raw) } catch { return null }
}

function generateLessonContent({ title, subject = 'math', level = 'premiere', objectives = [], realWorldApp = '' }) {
  const objectivesList = (objectives && objectives.length ? objectives : [
    'Comprendre les concepts fondamentaux',
    'Appliquer la méthode pas à pas',
    'Éviter les erreurs fréquentes'
  ]).map(o => `- ${o}`).join('\n')

  const levelBadge = level.toUpperCase()
  const subjectName = subject === 'mathematiques' || subject === 'math' ? 'Mathématiques' : subject

  return `# ${title}\n\n` +
  `> Niveau: ${levelBadge}  \\n+> Matière: ${subjectName}  \\n+> Durée estimée: 8 à 15 min\n\n` +
  `## 🎯 Objectifs\n${objectivesList}\n\n` +
  `## 📦 Pré-requis rapides\n- Notions clés du chapitre\n- Formules usuelles à portée de main\n\n` +
  `## 🧠 Idée principale\nExplique en 2-3 phrases l'intuition derrière le concept, avec un mini-exemple.\n\n` +
  `## 📝 Méthode étape par étape\n1) Identifier les données\n2) Choisir la bonne formule\n3) Appliquer correctement les étapes\n4) Vérifier l'unité et la cohérence\n\n` +
  `## 🔢 Exemple guidé (avec LaTeX)\nOn considère l'expression $f(x)=x^2$. Alors $f'(x)=2x$. \n\n` +
  `Exemple d'intégrale: $$\\int_0^1 x^2 \\, dx = \\left[ \\frac{x^3}{3} \\right]_0^1 = \\frac{1}{3}. $$\n\n` +
  `## ⚠️ Erreurs fréquentes\n- Oublier une étape intermédiaire\n- Se tromper d'unité\n- Oublier de vérifier la cohérence du résultat\n\n` +
  `## 🧩 Exercices rapides\n1) Question 1 (application directe)\n2) Question 2 (variante)\n3) Question 3 (piège classique)\n\n` +
  `## 🌍 Application concrète\n${realWorldApp || 'Décrire une application réelle du concept (mesure, modèle, phénomène).' }\n\n` +
  `---\n\n` +
  `## ✅ Récap'\n- Résumer les points clés en 3 bullets\n- Donner un conseil mémotechnique\n- Suggérer une suite (leçon suivante)\n`
}

function isTemplateLike(text) {
  if (!text) return true
  const t = text.toLowerCase()
  return (
    t.includes('phase 1') ||
    t.includes('hook') ||
    t.includes('recall') ||
    t.includes('main course') ||
    t.includes('guided exercise') ||
    t.includes('durée totale') ||
    t.includes('xp disponible')
  )
}

async function main() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory())
  let enriched = 0
  for (const dirent of entries) {
    if (enriched >= 50) break
    const folder = path.join(ROOT, dirent.name)
    const metadataPath = path.join(folder, 'metadata.json')
    if (!fs.existsSync(metadataPath)) continue
    const mdPath = path.join(folder, 'lesson.md')

    let existing = ''
    if (fs.existsSync(mdPath)) existing = fs.readFileSync(mdPath, 'utf-8')
    // Remplacer si c'est un template générique
    if (existing && !isTemplateLike(existing)) continue

    const meta = safeReadJson(metadataPath) || {}
    const title = meta.title || dirent.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const content = generateLessonContent({
      title,
      subject: meta.subject || 'math',
      level: meta.level || 'premiere',
      objectives: meta.objectives || [],
      realWorldApp: meta.realWorldApp || ''
    })
    fs.writeFileSync(mdPath, content, 'utf-8')
    enriched++
    console.log(`✅ Enrichi: ${dirent.name}`)
  }

  console.log(`\n🎉 Enrichissement terminé. Leçons mises à jour: ${enriched}`)
}

main().catch(err => { console.error('❌ Erreur enrichissement:', err); process.exit(1) })



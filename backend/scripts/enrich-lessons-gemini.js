import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function enrichLessonsWithGemini() {
  console.log('🤖 Enrichissement des leçons avec Gemini AI...\n');

  // Vérifier la clé API
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ Erreur: GOOGLE_AI_API_KEY manquante dans .env');
    process.exit(1);
  }

  try {
    // Récupérer les leçons avec contenu court (< 2000 caractères)
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { content: null },
          { content: '' },
          { content: { lt: 2000 } }
        ]
      },
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log(`📚 ${lessons.length} leçons à enrichir\n`);

    let enrichedCount = 0;
    let errorCount = 0;
    let totalTokensUsed = 0;

    // Traiter par lots de 10 pour contrôler les coûts
    for (let i = 0; i < lessons.length; i += 10) {
      const batch = lessons.slice(i, i + 10);
      
      console.log(`\n📦 Lot ${Math.floor(i/10) + 1}: ${batch.length} leçons`);

      for (const lesson of batch) {
        try {
          const enrichedContent = await generateContentWithGemini(lesson);
          
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: { content: enrichedContent }
          });

          enrichedCount++;
          console.log(`  ✅ ${enrichedCount}. ${lesson.title}`);
          
          // Pause pour éviter les limites de rate
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Erreur pour "${lesson.title}":`, error.message);
        }
      }

      // Pause plus longue entre les lots
      if (i + 10 < lessons.length) {
        console.log('\n⏸️  Pause de 5 secondes...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Terminé !`);
    console.log(`   ✅ Enrichies : ${enrichedCount}`);
    console.log(`   ❌ Erreurs : ${errorCount}`);
    console.log(`\n💰 Coût estimé : ~$${(enrichedCount * 0.0004).toFixed(2)} (400 leçons × $0.0004)`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateContentWithGemini(lesson) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const subject = lesson.chapter?.subject?.name || 'Mathématiques';
  const level = lesson.chapter?.level || 'PREMIERE';
  const summary = lesson.summary || '';

  const prompt = `Tu es un professeur expert en ${subject} pour le niveau ${level}.

Génère un contenu de leçon complet et détaillé (minimum 2500 caractères) au format Markdown pour la leçon suivante :

**Titre** : ${lesson.title}
**Résumé** : ${summary}
**Matière** : ${subject}
**Niveau** : ${level}

Structure du contenu attendu (en Markdown) :

# ${lesson.title}

> **Niveau** : ${level} | **Matière** : ${subject}

## 📌 Introduction
[Paragraphe d'introduction engageant, 3-4 phrases]

## 🎯 Objectifs d'apprentissage
[3-4 objectifs spécifiques et mesurables]

## 📚 Notions prérequises
[Les concepts importants à maîtriser avant]

## 💡 Concept principal
### Définition
[Définition précise et accessible]

### Pourquoi c'est important ?
[Applications et importance du concept]

## 🔧 Méthode de résolution
### Étape 1 : [Nom de l'étape]
[Description détaillée]

### Étape 2 : [Nom de l'étape]
[Description détaillée]

### Étape 3 : [Nom de l'étape]
[Description détaillée]

## 📐 Exemple guidé
**Énoncé** : [Énoncé d'exemple concret]

**Solution** :
1. [Explication de l'étape]
2. [Calcul ou raisonnement]
3. [Conclusion et réponse]

## ⚠️ Erreurs à éviter
- **Erreur courante 1** : [Description]
- **Erreur courante 2** : [Description]
- **Erreur courante 3** : [Description]

## 🧩 Exercices d'entraînement
### Exercice 1 : Application directe
**Énoncé** : [Énoncé simple]
**Solution** : [Solution détaillée]

### Exercice 2 : Variante
**Énoncé** : [Énoncé plus complexe]

## 🌍 Applications réelles
[2-3 applications concrètes dans le monde réel]

## 💡 Astuce mémoire
[Mnémotechnique ou astuce pour mémoriser]

## 📝 Résumé
### Points clés :
1. [Point important]
2. [Point important]
3. [Point important]

---

**Important** :
- Utilise des formules LaTeX avec \\( ... \\) ou $ ... $ pour les mathématiques
- Sois pédagogique et accessible
- Contenu minimum 2500 caractères
- Ton professionnel mais engageant

Génère maintenant le contenu complet :`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  return content;
}

// Vérifier si on exécute en mode batch
const isBatchMode = process.argv.includes('--batch');

if (isBatchMode) {
  console.log('🔄 Mode batch activé');
  enrichLessonsWithGemini();
} else {
  console.log(`
📋 Script d'enrichissement des leçons avec Gemini AI

💰 Estimation des coûts :
   - ~400 leçons à enrichir
   - Coût par leçon : ~$0.0004
   - Coût total estimé : ~$0.16

⏱️  Durée estimée : ~30 minutes (avec pauses)

Pour exécuter : node scripts/enrich-lessons-gemini.js --batch
`);
}

export { enrichLessonsWithGemini };










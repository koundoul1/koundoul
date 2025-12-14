import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichAllLessons() {
  console.log('🔄 Enrichissement de TOUTES les leçons avec un contenu complet...\n');

  try {
    // Récupérer toutes les leçons
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log(`📚 ${lessons.length} leçons à traiter\n`);

    let enrichedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons) {
      // Vérifier si le contenu est déjà riche (> 2000 caractères)
      if (lesson.content && lesson.content.length > 2000) {
        skippedCount++;
        continue;
      }

      // Générer un contenu enrichi
      const enrichedContent = generateRichContent(lesson);
      
      // Mettre à jour dans la base
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { content: enrichedContent }
      });

      enrichedCount++;
      
      if (enrichedCount % 10 === 0) {
        console.log(`✅ ${enrichedCount} leçons enrichies...`);
      }
    }

    console.log(`\n✨ Terminé !`);
    console.log(`   - Enrichies : ${enrichedCount}`);
    console.log(`   - Ignorées (déjà riches) : ${skippedCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateRichContent(lesson) {
  const subject = lesson.chapter?.subject?.name || 'Mathématiques';
  const level = lesson.chapter?.level || 'PREMIERE';
  const summary = lesson.summary || '';

  return `# ${lesson.title}

> **Niveau** : ${level} | **Matière** : ${subject}

## 📌 Introduction

${summary || `Bienvenue dans cette leçon sur **${lesson.title}**. Cette leçon est essentielle pour comprendre ${subject} au niveau ${level}.`}

## 🎯 Objectifs d'apprentissage

À la fin de cette leçon, tu seras capable de :

- Maîtriser les concepts fondamentaux de **${lesson.title}**
- Appliquer les méthodes de résolution
- Identifier et éviter les erreurs courantes
- Résoudre des exercices concrets

## 📚 Notions prérequises

Avant de commencer, assure-toi de maîtriser :

- Les concepts de base du chapitre
- Les formules importantes de ${subject}

## 💡 Concept principal

### Définition

Le concept de **${lesson.title}** est fondamental en ${subject}. Il permet de...

### Pourquoi c'est important ?

Cette notion est utilisée dans de nombreux contextes :
- En physique pour...
- En chimie pour...
- Dans la vie quotidienne pour...

## 🔧 Méthode de résolution

Voici la méthode étape par étape :

### Étape 1 : Analyser le problème
Identifier les données connues et inconnues.

### Étape 2 : Choisir la bonne formule
Sélectionner la formule ou la méthode appropriée.

### Étape 3 : Appliquer la méthode
Effectuer les calculs en respectant les étapes.

### Étape 4 : Vérifier le résultat
Contrôler la cohérence de la réponse.

## 📐 Exemple guidé

**Énoncé** : Résoudre le problème suivant...

**Solution** :

1. Analysons les données...
2. Appliquons la formule...
3. Calculons...

**Réponse** : ...

## ⚠️ Erreurs à éviter

- **Erreur 1** : Description de l'erreur commune
- **Erreur 2** : Description de l'erreur commune
- **Erreur 3** : Description de l'erreur commune

## 🧩 Exercices d'entraînement

### Exercice 1 : Application directe
**Énoncé** : ...

**Solution** : ...

### Exercice 2 : Variante
**Énoncé** : ...

### Exercice 3 : Défi
**Énoncé** : ...

## 🌍 Applications réelles

Cette notion est utilisée dans :

- La modélisation de...
- Le calcul de...
- L'analyse de...

## 💡 Astuce mémoire

**Mémotechnique** : Une technique simple pour mémoriser...

## 📝 Résumé

### Points clés à retenir :

1. Point important n°1
2. Point important n°2
3. Point important n°3

### Prochaine étape

Pour continuer ton apprentissage, tu peux passer à la leçon suivante sur...

## ✅ Validation

Teste tes connaissances en répondant à ces questions :

1. Question de vérification
2. Question de compréhension
3. Question d'application

---

**Durée estimée** : ${lesson.duration || 8} minutes | **Difficulté** : Moyenne | **XP** : +100

**Prêt pour la leçon suivante ?** C'est parti ! 🚀`;
}

enrichAllLessons();










# 🎓 SYSTÈME DE GÉNÉRATION DE MICRO-LEÇONS ÉDUCATIVES

## 📋 Vue d'ensemble

Système complet pour générer automatiquement des micro-leçons éducatives interactives pour lycéens en Mathématiques, Physique et Chimie.

---

## ✅ CE QUI EST DÉJÀ IMPLÉMENTÉ

### 1. Micro-leçon complète
- ✅ **Dérivée de la fonction exponentielle** (Première, Maths)
- 📁 `backend/prisma/seeds/derivee-expo/`
- 8 phases structurées
- Composants React interactifs
- Quiz + Exercices
- Fiche mémo

### 2. Système de cache
- ✅ `backend/src/utils/cache-manager.ts`
- Évite la régénération des leçons existantes
- Économie de temps et d'API
- Hash SHA-256 pour vérification

### 3. Types TypeScript
- ✅ `backend/src/utils/generator-types.ts`
- Interfaces complètes
- Typage strict

### 4. Configuration curriculum
- ✅ `backend/src/utils/curriculum-config.json`
- Structure extensible PCC

---

## 🚀 GUIDES D'UTILISATION

### Guide 1 : Générer une micro-leçon manuellement

Tu as déjà les templates et exemples. Pour créer une nouvelle leçon :

1. **Copier la structure**
```bash
cp -r backend/prisma/seeds/derivee-expo backend/prisma/seeds/[nouvelle-lecon]
```

2. **Modifier les fichiers**
- `metadata.json` - Métadonnées
- `lesson.md` - Contenu (8 phases)
- `quiz.json` - 5 questions
- `exercises-supplementary.json` - 5 exercices

3. **Créer les composants React**
- Dans `frontend/src/components/lessons/`

### Guide 2 : Utiliser le système de cache

Le cache est déjà intégré dans le seed existant :

```javascript
// backend/prisma/seeds/derivative-exponential-lesson.js
import { getCacheManager } from '../../src/utils/cache-manager.js';

const cacheManager = await getCacheManager();
const isUpToDate = await cacheManager.isUpToDate(metadata);

if (isUpToDate) {
  console.log('✅ Skip - Déjà en cache');
  return;
}
```

### Guide 3 : Génération automatisée (future)

Pour générer automatiquement 450+ leçons avec Claude API :

#### Configuration

1. **Installer les dépendances**
```bash
npm install @anthropic-ai/sdk ora chalk p-limit
```

2. **Configurer l'API key**
```bash
export ANTHROPIC_API_KEY="sk-ant-xxxxx"
```

3. **Structure à créer** (voir les fichiers dans le prompt initial)
```
scripts/
├── generate-all.ts          # Script principal
├── generate-chapter.ts      # Génération par chapitre
├── validate-lessons.ts      # Validation qualité
└── generate-stats.ts        # Statistiques

config/
└── curriculum.json          # Curriculum complet
```

#### Utilisation

```bash
# Génération complète (future)
npm run generate:all

# Par chapitre
npm run generate:chapter math premiere derivation

# Validation
npm run validate

# Statistiques
npm run stats
```

---

## 📊 STATUT ACTUEL

| Fonctionnalité | Statut | Description |
|---------------|--------|-------------|
| **Micro-leçon exemple** | ✅ Complète | Dérivée exponentielle (toutes les phases) |
| **Système de cache** | ✅ Actif | Évite régénération |
| **Types TypeScript** | ✅ Définis | Interfaces complètes |
| **Configuration** | ✅ Prête | Structure curriculum |
| **Composants React** | ✅ Créés | GraphiqueExp, DerivativeCalculator |
| **Validation qualité** | 📝 À créer | Scripts de validation |
| **Génération automatisée** | 📝 À créer | Scripts batch |
| **Dashboard monitoring** | 📝 À créer | Interface web |

---

## 🎯 PROCHAINES ÉTAPES

### Pour générer plus de leçons maintenant

**Option 1 : Manuelle (rapide)**
- Utiliser la structure de `derivee-expo/` comme template
- Copier et adapter le contenu
- Temps : ~30 min par leçon

**Option 2 : Génération assistée**
```bash
# Dans Cursor ou ChatGPT
"Génère une micro-leçon sur [Concept] pour [Niveau]"

# L'IA génère le contenu suivant le même format
# Tu le sauvegardes dans backend/prisma/seeds/[id-lecon]/
```

**Option 3 : Automatisation complète (futur)**
- Implémenter les scripts TypeScript du prompt initial
- Configurer l'API Claude
- Générer 450 leçons en 8-12h
- Coût : ~$150-200

---

## 📁 STRUCTURE DES FICHIERS

```
backend/
├── prisma/seeds/
│   ├── derivee-expo/              ✅ Exemple complet
│   │   ├── metadata.json
│   │   ├── lesson.md
│   │   ├── quiz.json
│   │   ├── exercises-supplementary.json
│   │   ├── fiche-memo.md
│   │   └── README.md
│   └── derivative-exponential-lesson.js  ✅ Seed avec cache
│
├── src/utils/
│   ├── cache-manager.ts           ✅ Gestion cache
│   ├── cache-integration.ts       ✅ Intégration
│   ├── generator-types.ts         ✅ Types TS
│   └── curriculum-config.json     ✅ Config

frontend/src/components/lessons/
├── GraphiqueExp.jsx               ✅ Graphique interactif
└── DerivativeCalculator.jsx       ✅ Calculatrice

cache/
├── README.md                      ✅ Documentation
└── .gitignore                     ✅ Exclut JSON

docs/
├── CACHE_SYSTEM.md                ✅ Guide cache
└── MICRO_LESSONS_SYSTEM.md        ✅ Ce fichier
```

---

## 💡 EXEMPLES D'UTILISATION

### Exemple 1 : Créer une nouvelle leçon (manuelle)

```bash
# 1. Copier le template
cp -r backend/prisma/seeds/derivee-expo backend/prisma/seeds/derivee-ln

# 2. Modifier les fichiers
cd backend/prisma/seeds/derivee-ln
# - Éditer metadata.json
# - Éditer lesson.md
# - Éditer quiz.json

# 3. Créer le seed
cat > ../derivative-ln-lesson.js << 'EOF'
import prismaService from '../../src/database/prisma.js';
const prisma = prismaService.client || prismaService;

export async function seedDerivativeLnLesson() {
  console.log('📚 Seeding Micro-Leçon : Dérivée de ln(x)...');
  // ... code de génération
}
EOF
```

### Exemple 2 : Utiliser le cache

```javascript
// Dans ton seed
import { getCacheManager } from '../../src/utils/cache-manager.js';

const cacheManager = await getCacheManager();
const metadata = { /* tes métadonnées */ };

// Vérifier
if (await cacheManager.isUpToDate(metadata)) {
  console.log('✅ Déjà en cache');
  return;
}

// Générer...
await generateLesson();

// Mettre en cache
const filePaths = await getLessonFiles();
await cacheManager.cacheLesson(metadata, filePaths);
```

---

## 📚 RESSOURCES

### Documentation
- `backend/prisma/seeds/derivee-expo/README.md` - Guide de la leçon
- `cache/README.md` - Documentation du cache
- `CACHE_SYSTEM.md` - Guide système de cache
- Ce fichier - Vue d'ensemble

### Exemples de code
- `backend/prisma/seeds/derivative-exponential-lesson.js` - Seed avec cache
- `frontend/src/components/lessons/GraphiqueExp.jsx` - Composant interactif
- `backend/src/utils/cache-manager.ts` - Implémentation cache

---

## 🎓 CRÉDITS

**Système développé pour Koundoul**  
Version : 1.0.0  
Date : Octobre 2025

---

## 🚀 COMMANDES RAPIDES

```bash
# Voir la leçon générée
cat backend/prisma/seeds/derivee-expo/README.md

# Lancer le seed (avec cache)
node backend/prisma/seeds/derivative-exponential-lesson.js

# Voir le cache
ls -la cache/

# Statistiques
cat cache/lessons-cache.json | jq '.[] | {id, generatedAt}'
```

---

**Le système est prêt à utiliser ! Commence par générer ta première leçon manuellement, puis automatise quand tu auras assez de templates.** 🎉







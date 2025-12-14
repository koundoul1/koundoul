# 📖 GUIDE DE GÉNÉRATION MANUELLE DE MICRO-LEÇONS

大字

## 🎯 Vue d'ensemble

Ce guide te permet de créer rapidement des micro-leçons complètes en suivant un modèle éprouvé.

---

## 📊 STATUT ACTUEL

### Leçons créées : **6 leçons**

#### Existant dans le système (seeds originaux)
1. ✅ Les ensembles de nombres (Seconde)
2. ✅ Priorités opératoires (Seconde)
3. ✅ Résoudre une équation simple (Seconde)
4. ✅ Définition d'une fonction affine (Seconde)

#### Micro-leçons créées récemment
5. ✅ **Dérivée de la fonction exponentielle** (Première) - COMPLÈTE
6. 🚧 **Dérivée d'une fonction composée** (Première) - EN COURS

---

## 🚀 MÉTHODE RAPIDE : Génération en 10 minutes

### Étape 1 : Copier le template (30 sec)

```bash
# Copier la leçon complète existante
cp -r backend/prisma/seeds/derivee-expo backend/prisma/seeds/[nouvelle-lecon]
```

### Étape 2 : Modifier metadata.json (2 min)

Éditer `metadata.json` :
- Changer l'`id`, `title`, `chapter`
- Modifier les `prerequisites` et `objectives`
- Ajuster la `difficulty` et `realWorldApp`

### Étape 3 : Modifier lesson.md (5 min)

Dans `lesson.md` :
- Adapter le contenu pour ton sujet
- Garder la structure des 8 phases
- Modifier les exemples

### Étape 4 : Modifier quiz.json (2 min)

Créer 5 questions QCM adaptées au sujet

### Étape 5 : Modifier exercises-supplementary.json (2 min)

Créer offres additional exercises

### Total : **~10 minutes** 🎯

---

## 📋 CHECKLIST DE VALIDATION

Pour chaque micro-leçon, vérifier :

- [ ] metadata.json complet et cohérent
- [ ] lesson.md avec 8 phases distinctes
- [ ] quiz.json avec exactement 5 questions
- [ ] exercises-supplementary.json avec 5 exercices
- [ ] fiche-memo.md téléchargeable
- [ ] README.md avec instructions
- [ ] Durée totale : 7-9 minutes
- [ ] Minimum 8 interactions
- [ ] Erreurs achievements classiques incluses
- [ ] Lien vie réelle présent

---

## 🎨 SUJETS SUGGÉRÉS POUR PROCHAINES LEÇONS

### Mathématiques - Première

**Dérivation**
- [ ] Dérivée d'une fonction composée (EN COURS)
- [ ] Tangente et nombre dérivé
- [ ] Variations d'une fonction avec dérivée
- [ ] Optimum local/global

**Second degré**
- [ ] Équation ax² + bx + c = 0
- [ ] Discriminant et nombre de solutions
- [ ] Factorisation d'un trinôme
- [ ] Signe d'un trinôme

**Exponentielle et Logarithme**
- [ ] Fonction logarithme népérien
- [ ] Dérivée de ln(x)
- [ ] Équations exponentielles
- [ ] Équations logarithmiques

**Probabilités**
- [ ] Loi de probabilité
- [ ] Espérance mathématique
- [ ] Variance et écart-type
- [ ] Loi binomiale

### Physique - Première

**Mécanique**
- [ ] Mouvement rectiligne uniforme
- [ ] Mouvement uniformément accéléré
- [ ] Forces et principe fondamental
- [ ] Énergie cinétique et potentielle

**Électricité**
- [ ] Loi d'Ohm
- [ ] Puissance électrique
- [ ] Association de résistances
- [ ] Condensateur

### Chimie - Première

**Transformation chimique**
- [ ] Équation chimique
- [ ] Bilan de matière
- [ ] Rendement d'une réaction
- [ ] Acides et bases

---

## 🔄 GROSSESSE DE CRÉATION

### Mode Rapide (10 min/leçon)

Utiliser le template complet et adapter :
```bash
cp -r derivee-expo nouvelle-lecon
# Modifier les fichiers
```

### Mode Standard (20 min/leçon)

Créer tout depuis zéro en suivant la structure

### Mode Approfondi (45 min/leçon)

Créer + ajouter composants React + tests

---

## 📊 OBJECTIF DE GÉNÉRATION

| Niveau | Objectif | Actuel | Reste |
|--------|----------|--------|-------|
| Seconde | 50 leçons | 4 | 46 |
| Première | 100 leçons | 2 | 98 |
| Terminale | 150 leçons | 0 | 150 |
| **TOTAL** | **300 leçons** | **6** | **294** |

---

## 💡 ASTUCE

**Génération par chapitre** : Crée toutes les leçons d'un chapitre en une fois (ex: tout le chapitre "Dérivation" = 8-10 leçons)

**Temps estimé pour 294 leçons restantes** :
- Mode rapide : ~49 heures
- Mode standard : ~98 heures
- Avec génération partielle IA : ~20-30 heures

---

## 🎉 COMMANDES UTILES

```bash
# Lister les leçons existantes
ls -la backend/prisma/seeds/*/

# Voir une leçon
cat backend/prisma/seeds/derivee-expo/README.md

# Compter les leçons
find backend/prisma/seeds -type d -mindepth 1 | wc -l

# Lancer le seed
node backend/prisma/seeds/derivative-exponential-lesson.js
```

---

## 📞 BESOIN D'AIDE ?

Voir la documentation complète dans :
- `MICRO_LESSONS_SYSTEM.md` - Vue d'ensemble
- `CACHE_SYSTEM.md` - Gestion du cache
- `backend/prisma/seeds/derivee-expo/README.md` - Exemple complet

---

**Bon courage pour la génération ! 🚀**















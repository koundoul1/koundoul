# 🚀 GUIDE DE DÉMARRAGE COMPLET - KOUNDOUL

**Version** : 2.0.0  
**Date** : 19 octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#-prérequis)
2. [Installation Initiale](#-installation-initiale)
3. [Configuration Base de Données](#-configuration-base-de-données)
4. [Démarrage](#-démarrage)
5. [Accès à la Plateforme](#-accès-à-la-plateforme)
6. [Test des Nouvelles Fonctionnalités](#-test-des-nouvelles-fonctionnalités)
7. [Dépannage](#-dépannage)

---

## ✅ PRÉREQUIS

### Logiciels requis

| Logiciel | Version | Vérification |
|----------|---------|--------------|
| Node.js | 20.x ou supérieur | `node --version` |
| npm | 10.x ou supérieur | `npm --version` |
| PostgreSQL | 15.x ou supérieur | `psql --version` |

### Compte Supabase (Recommandé)

Si vous n'avez pas PostgreSQL local, créez un compte gratuit sur [Supabase](https://supabase.com) :
1. Créer un nouveau projet
2. Récupérer la **Database URL** dans Settings → Database

---

## 📦 INSTALLATION INITIALE

### 1. Cloner le projet (si pas déjà fait)

```bash
cd C:\Users\conta\OneDrive\Bureau\koundoul
```

### 2. Installer les dépendances Backend

```powershell
cd backend
npm install
```

**Packages installés** :
- express, cors, helmet (serveur)
- prisma, @prisma/client (ORM)
- bcryptjs, jsonwebtoken (auth)
- @google/generative-ai (Gemini AI)
- winston, morgan (logging)

### 3. Installer les dépendances Frontend

```powershell
cd ..\frontend
npm install
```

**Packages installés** :
- react, react-dom, react-router-dom
- vite (build tool)
- tailwindcss, postcss, autoprefixer
- lucide-react (icônes)
- react-markdown (affichage leçons)

---

## 🗄️ CONFIGURATION BASE DE DONNÉES

### 1. Créer le fichier `.env`

```powershell
cd ..\backend
copy env.example .env
```

### 2. Éditer `.env`

Ouvrir `backend/.env` et configurer :

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:5432/koundoul"

# JWT
JWT_SECRET="votre-secret-super-securise-minimum-32-caracteres-ici"
JWT_EXPIRES_IN="7d"

# Gemini AI (optionnel)
GEMINI_API_KEY="votre-cle-api-gemini"

# Serveur
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ Important** : Remplacer `DATABASE_URL` par votre connexion PostgreSQL ou Supabase.

### 3. Initialiser la base de données

```powershell
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Voir les données
npx prisma studio
```

### 4. Peupler la base avec des données de test

```powershell
npm run db:seed
```

**Données créées** :
- ✅ Matières (Mathématiques, Physique, Chimie)
- ✅ Chapitres (Seconde - 3 chapitres de maths)
- ✅ Leçons (4 leçons complètes)
- ✅ Exercices (5 exercices progressifs)
- ✅ Quiz (2 quiz mathématiques)
- ✅ Badges (18 badges gamification)

### 5. Créer un utilisateur de test

```powershell
node create-test-user.js
```

**Identifiants créés** :
- Email : `sambafaye184@yahoo.fr`
- Password : `atsatsATS1.ATS`

---

## 🚀 DÉMARRAGE

### Méthode 1 : Script PowerShell (Recommandé)

```powershell
# À la racine du projet
.\start-all-fixed.ps1
```

Ce script démarre automatiquement :
- ✅ Backend sur http://localhost:3001
- ✅ Frontend sur http://localhost:3000

### Méthode 2 : Manuelle (2 terminaux)

**Terminal 1 - Backend** :
```powershell
cd backend
node server.js
```

Attendez de voir :
```
✅ Base de données connectée
🚀 Serveur Koundoul démarré !
📍 Port: 3001
```

**Terminal 2 - Frontend** :
```powershell
cd frontend
npm run dev
```

Attendez de voir :
```
VITE ready in XXX ms
➜ Local: http://localhost:3000/
```

---

## 🌐 ACCÈS À LA PLATEFORME

### 1. Ouvrir le navigateur

```
http://localhost:3000
```

### 2. Se connecter

Utiliser l'utilisateur de test créé :
- **Email** : `sambafaye184@yahoo.fr`
- **Password** : `atsatsATS1.ATS`

**Ou créer un nouveau compte** via "S'inscrire".

### 3. Navigation

Une fois connecté, vous avez accès à :

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/dashboard` | Vue d'ensemble progression |
| **Cours** | `/courses` | Matières et chapitres |
| **Quiz** | `/quiz` | Tests de connaissances |
| **Révisions** | `/flashcards` | Flashcards algorithme SM-2 |
| **Forum** | `/forum` | Discussions communautaires |
| **Badges** | `/badges` | Collection de badges |
| **Profil** | `/profile` | Informations personnelles |

---

## 🧪 TEST DES NOUVELLES FONCTIONNALITÉS

### A. Tester les Flashcards

#### 1. Accéder aux flashcards
```
http://localhost:3000/flashcards
```

#### 2. Créer une flashcard manuellement
Via l'API directement (Postman ou script) :
```bash
POST http://localhost:3001/api/flashcards
Authorization: Bearer <votre-token>

{
  "question": "Quelle est la formule du discriminant ?",
  "answer": "Δ = b² - 4ac",
  "explanation": "Pour une équation ax² + bx + c = 0",
  "subjectId": "<id-matiere>",
  "difficulty": "MOYEN",
  "tags": ["mathématiques", "équations"]
}
```

#### 3. Réviser les flashcards
1. Cliquer sur "Commencer" sur la page flashcards
2. La question s'affiche
3. Cliquer pour révéler la réponse
4. Choisir la difficulté :
   - **Rouge (Difficile)** : Revoir demain
   - **Jaune (Bon)** : Dans quelques jours
   - **Vert (Facile)** : Plus tard

#### 4. Vérifier les statistiques
- Taux de rétention
- Nombre de cartes maîtrisées
- Streak de révision

### B. Tester le Forum

#### 1. Créer une discussion
1. Aller sur `/forum`
2. Cliquer "Nouvelle discussion"
3. Choisir catégorie (Question, Explication, etc.)
4. Remplir titre et description
5. Publier

#### 2. Ajouter une réponse
1. Ouvrir une discussion
2. Faire défiler jusqu'au formulaire
3. Écrire une réponse
4. Publier

#### 3. Voter
- Cliquer sur 👍 pour upvote
- Cliquer sur 👎 pour downvote

#### 4. Marquer meilleure réponse
Si vous êtes l'auteur de la discussion :
1. Trouver la meilleure réponse
2. Cliquer "Marquer comme meilleure réponse"
3. Un badge 🏆 apparaît

### C. Tester le Multi-langue

#### 1. Changer la langue
En haut à droite du Header :
1. Cliquer sur le bouton 🇫🇷 FR
2. La langue bascule en 🇬🇧 EN
3. Toute l'interface change

#### 2. Vérifier la persistance
1. Changer la langue
2. Rafraîchir la page (F5)
3. La langue reste en place (localStorage)

### D. Tester le Mode PWA

#### 1. Tester l'offline
1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Cocher "Offline"
4. Rafraîchir la page
5. Une bannière "Hors ligne" apparaît

#### 2. Installer l'app (Chrome/Edge)
1. Regarder dans la barre d'adresse
2. Icône "Installer" apparaît
3. Cliquer pour installer
4. L'app s'ouvre en mode standalone

---

## 🔧 DÉPANNAGE

### Problème : Backend ne démarre pas

**Erreur** : `Port 3001 already in use`

**Solution** :
```powershell
# Tuer tous les processus Node
taskkill /F /IM node.exe

# Redémarrer
cd backend
node server.js
```

---

### Problème : Base de données non connectée

**Erreur** : `Can't reach database server`

**Solutions** :
1. Vérifier que PostgreSQL tourne
2. Vérifier `DATABASE_URL` dans `.env`
3. Tester la connexion :
   ```powershell
   cd backend
   npx prisma db push
   ```

---

### Problème : Erreur CORS

**Erreur** : `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution** :
1. Vérifier `CORS_ORIGIN` dans `backend/.env`
2. Ajouter l'URL du frontend :
   ```env
   CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
   ```
3. Redémarrer le backend

---

### Problème : Login échoue

**Erreur** : `Email ou mot de passe incorrect`

**Solution** :
1. Recréer l'utilisateur de test :
   ```powershell
   cd backend
   node create-test-user.js
   ```
2. Utiliser les identifiants exacts :
   - Email : `sambafaye184@yahoo.fr`
   - Password : `atsatsATS1.ATS`

---

### Problème : Flashcards vides

**Cause** : Pas de flashcards dans la base

**Solution** :
Créer des flashcards via l'API :
```powershell
cd backend
node test-new-features.js
```

---

### Problème : Forum vide

**Cause** : Pas de discussions

**Solution** :
1. Se connecter sur `/login`
2. Aller sur `/forum/new`
3. Créer une première discussion

---

### Problème : Gemini AI ne fonctionne pas

**Cause** : Pas de clé API ou quota épuisé

**Solution** :
1. Obtenir une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ajouter dans `backend/.env` :
   ```env
   GEMINI_API_KEY="votre-cle-ici"
   ```
3. Redémarrer le backend

**Note** : Le solver IA est optionnel. Le reste fonctionne sans.

---

## 📊 VÉRIFICATION DE SANTÉ

### Backend Health Check
```
http://localhost:3001/health
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 123.45
  }
}
```

### Frontend
```
http://localhost:3000
```

**Réponse attendue** : Page d'accueil Koundoul

---

## 🧪 TESTS AUTOMATISÉS

### Backend API Tests

```powershell
cd backend
node test-new-features.js
```

**Tests exécutés** :
- ✅ Connexion
- ✅ Flashcards Stats
- ✅ Flashcards Créer
- ✅ Flashcards Réviser
- ✅ Forum Créer
- ✅ Forum Liste
- ✅ Forum Répondre
- ✅ Forum Voter

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation
- [`README.md`](./README.md) - Vue d'ensemble
- [`FEATURES_COMPLETE.md`](./FEATURES_COMPLETE.md) - Fonctionnalités implémentées
- [`backend/SETUP_GUIDE.md`](./backend/SETUP_GUIDE.md) - Setup backend détaillé
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Guide de tests

### Scripts utiles
```powershell
# Réinitialiser la base
cd backend
npx prisma db push --force-reset
npm run db:seed

# Voir les données
npx prisma studio

# Logs backend
node server.js > logs.txt 2>&1

# Build frontend pour production
cd frontend
npm run build
```

---

## 🎯 PARCOURS UTILISATEUR TYPIQUE

### 1. Première visite (5 min)
1. S'inscrire via `/register`
2. Compléter le profil
3. Voir le dashboard (XP: 0, Niveau: 1)

### 2. Apprentissage (20 min)
1. `/courses` → Choisir Mathématiques
2. Sélectionner un chapitre
3. Lire une leçon → +5 XP
4. Faire un exercice → +10 XP
5. Badge "Premier Pas" débloqué 🎉

### 3. Révision (10 min)
1. `/flashcards` → Créer ou réviser
2. Session de 10 cartes
3. Algorithme SM-2 ajuste la difficulté

### 4. Quiz (15 min)
1. `/quiz` → Choisir un quiz
2. Répondre aux questions
3. Soumettre → Voir résultats
4. Badge "Quiz Master" débloqué 🎉

### 5. Forum (10 min)
1. `/forum` → Poser une question
2. Recevoir des réponses
3. Marquer la meilleure réponse
4. Contribuer à d'autres discussions

---

## 🎉 FÉLICITATIONS !

Vous êtes maintenant prêt à utiliser **Koundoul** au maximum de ses capacités !

### Fonctionnalités disponibles :
- ✅ Apprentissage structuré (Collège → Lycée → Supérieur)
- ✅ Révision espacée scientifique (SM-2)
- ✅ Forum communautaire
- ✅ Multi-langue (FR/EN)
- ✅ Mode hors ligne (PWA)
- ✅ Gamification (XP, niveaux, badges)
- ✅ IA pour résolution de problèmes
- ✅ Dashboard analytics complet

**Bon apprentissage !** 🚀🎓

---

**Besoin d'aide ?**  
Consultez les fichiers de documentation ou créez une issue sur GitHub.

**Version** : 2.0.0  
**Dernière mise à jour** : 19 octobre 2025



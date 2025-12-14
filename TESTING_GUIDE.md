# 🧪 Guide de Test - Plateforme Koundoul

## 📋 Ce qui a été créé

### ✅ Backend API Complète

1. **Module Auth** (`/api/auth`)
   - ✅ POST `/register` - Inscription
   - ✅ POST `/login` - Connexion
   - ✅ GET `/profile` - Profil utilisateur

2. **Module Solver** (`/api/solver`)
   - ✅ POST `/solve` - Résoudre un problème avec Gemini AI
   - ✅ GET `/history` - Historique des problèmes

3. **Module Content** (`/api/content`)
   - ✅ GET `/subjects` - Liste des matières
   - ✅ GET `/subjects/:slug` - Détail d'une matière
   - ✅ GET `/subjects/:slug/chapters?level=SECONDE` - Chapitres par niveau
   - ✅ GET `/subjects/:slug/chapters/:chapterSlug` - Détail d'un chapitre
   - ✅ GET `/lessons/:lessonId` - Contenu d'une leçon
   - ✅ POST `/lessons/:lessonId/complete` - Marquer leçon comme complétée
   - ✅ GET `/exercises/:exerciseId` - Exercice
   - ✅ POST `/exercises/:exerciseId/submit` - Soumettre une réponse
   - ✅ GET `/progress/chapter/:chapterId` - Progression par chapitre

4. **Module Dashboard** (`/api/dashboard`)
   - ✅ GET `/` - Dashboard complet avec stats, progression, recommandations

### ✅ Frontend React Complet

1. **Pages Publiques**
   - ✅ `/` - Home (page d'accueil pédagogique)
   - ✅ `/login` - Connexion
   - ✅ `/register` - Inscription

2. **Pages Protégées**
   - ✅ `/dashboard` - Tableau de bord avec analytics
   - ✅ `/courses` - Liste des matières
   - ✅ `/courses/:slug` - Chapitres d'une matière
   - ✅ `/courses/:slug/chapters/:chapterSlug` - Détail chapitre
   - ✅ `/lessons/:lessonId` - Lecteur de leçon (Markdown)
   - ✅ `/exercises/:exerciseId` - Exercice interactif
   - ✅ `/solver` - Résolveur IA
   - ✅ `/quiz` - Quiz
   - ✅ `/profile` - Profil

### ✅ Base de Données

- ✅ 8 tables principales : Users, Subjects, Chapters, Lessons, Exercises, etc.
- ✅ 3 enums : Level, Difficulty, ExerciseType
- ✅ Relations complètes
- ✅ Seed avec 3 chapitres de mathématiques Seconde

---

## 🚀 Comment Tester

### Étape 1 : Démarrer le Backend

```bash
# Terminal 1
cd backend
node server.js
```

**Attendu** :
```
✅ Database connected successfully
🚀 Serveur Koundoul démarré !
📍 Port: 3001
```

### Étape 2 : Démarrer le Frontend

```bash
# Terminal 2
cd frontend
npm run dev
```

**Attendu** :
```
VITE ready in XXX ms
➜ Local: http://localhost:3002/
```

### Étape 3 : Tester l'Interface

1. **Ouvrir** : `http://localhost:3002`
2. **Connexion** : 
   - Email: `sambafaye184@yahoo.fr`
   - Password: `atsatsATS1.ATS`
3. **Dashboard** : Vérifier les stats, progression, recommandations
4. **Cours** : Cliquer sur "Cours" dans la nav
5. **Mathématiques** : Choisir niveau "Seconde"
6. **Chapitre** : Ouvrir "Nombres et Calculs"
7. **Leçon** : Lire "Les ensembles de nombres"
8. **Compléter** : Marquer comme complété → +5 XP
9. **Exercice** : Faire "Identifier les ensembles"
10. **Soumettre** : Entrer une réponse et voir la correction

---

## 🔍 Tests Backend Individuels

### Test 1 : Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

### Test 2 : Login
```powershell
$body = @{
    email = "sambafaye184@yahoo.fr"
    password = "atsatsATS1.ATS"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$token = $login.data.token
Write-Host "Token: $token"
```

### Test 3 : Subjects
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/content/subjects"
```

### Test 4 : Dashboard
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard" `
    -Headers @{
        "Authorization" = "Bearer $token"
    }
```

---

## 🐛 Résolution des Problèmes Courants

### Problème : Port déjà utilisé
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problème : Prisma Client outdated
```bash
cd backend
npx prisma generate
```

### Problème : Base de données désynchronisée
```bash
cd backend
npx prisma db push
npm run db:seed
```

### Problème : CORS Error
Vérifier que `.env` contient :
```
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:3002"
```

---

## 📊 Données de Test Disponibles

### Utilisateur
- Email: `sambafaye184@yahoo.fr`
- Password: `atsatsATS1.ATS`

### Contenu
- **Matière** : Mathématiques
- **Niveau** : Seconde
- **Chapitres** : 
  1. Nombres et Calculs (2 leçons, 2 exercices)
  2. Équations du 1er degré (1 leçon, 2 exercices)
  3. Fonctions affines (1 leçon, 1 exercice)

---

## ✅ Checklist de Vérification

- [ ] Backend démarre sur port 3001
- [ ] Frontend démarre sur port 3002
- [ ] Login fonctionne
- [ ] Dashboard affiche les stats
- [ ] Page Cours affiche les matières
- [ ] Navigation vers chapitres fonctionne
- [ ] Leçon s'affiche avec Markdown
- [ ] Bouton "Complété" ajoute XP
- [ ] Exercice s'affiche
- [ ] Soumission d'exercice fonctionne
- [ ] Solution s'affiche après soumission
- [ ] XP est ajouté si correct
- [ ] Navigation breadcrumb fonctionne

---

## 🎯 Prochaines Étapes

1. **Semaine 4** : Quiz complets avec timer
2. **Semaine 5** : Analytics avancés
3. **Semaine 6** : Polish UI/UX final

---

**Date de création** : 19 octobre 2025
**Statut** : ✅ MVP Pédagogique Complet



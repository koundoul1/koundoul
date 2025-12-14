# 🎓 Koundoul - Plateforme Pédagogique Scientifique

> **Apprends les sciences pas à pas, du collège au supérieur**

[![Status](https://img.shields.io/badge/status-MVP%20Ready-success)]()
[![Node](https://img.shields.io/badge/node-20.x-green)]()
[![React](https://img.shields.io/badge/react-18.x-blue)]()
[![PostgreSQL](https://img.shields.io/badge/postgresql-15.x-blue)]()

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20.x
- npm 10.x
- PostgreSQL (ou compte Supabase gratuit)

### Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd koundoul

# 2. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# 3. Configurer la base de données
cd backend
cp .env.example .env
# Éditer .env avec votre DATABASE_URL

# 4. Initialiser la base
npx prisma db push
npm run db:seed

# 5. Démarrer (2 terminaux)
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Ou utiliser le script PowerShell

```powershell
# À la racine du projet
./start-all.ps1
```

---

## 📚 Fonctionnalités

### 🎯 Apprentissage Structuré
- **3 niveaux** : Collège, Lycée, Supérieur
- **3 matières** : Mathématiques, Physique, Chimie
- **Chapitres progressifs** avec pré-requis
- **Leçons Markdown** : Contenu riche et formaté
- **Exercices interactifs** : QCM, Calcul, Démonstration

### 📈 Suivi de Progression
- **Dashboard analytique** : Stats, progression, activité
- **Système XP** : +5 XP par leçon, +10 XP par exercice
- **Niveaux** : Progression automatique
- **Streak** : Jours consécutifs d'apprentissage
- **Recommandations** : IA suggère quoi étudier

### 🎓 Pédagogie
- **Objectifs d'apprentissage** clairs
- **Indices progressifs** pour exercices
- **Solutions détaillées** étape par étape
- **Feedback immédiat** sur les réponses
- **Temps estimé** par activité

### 🤖 IA Générative (Gemini)
- **Résolveur intelligent** : Problèmes personnalisés
- **Explications détaillées** : Pas à pas
- **Multi-domaines** : Math, Physique, Chimie

---

## 🏗️ Architecture

```
koundoul/
├── backend/                 # API Express.js
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentification JWT
│   │   │   ├── content/     # Contenu pédagogique
│   │   │   ├── dashboard/   # Analytics
│   │   │   └── solver/      # IA Gemini
│   │   ├── middlewares/     # Auth, errors
│   │   ├── database/        # Prisma client
│   │   └── utils/           # Logger, helpers
│   └── prisma/
│       ├── schema.prisma    # 15 modèles
│       └── seeds/           # Contenu mathématiques
│
└── frontend/                # React + Vite
    └── src/
        ├── pages/           # 15 pages
        ├── components/      # Layout, UI
        ├── context/         # Auth context
        └── services/        # API client
```

---

## 🔌 API Endpoints

### Public
- `GET /health` - Santé du serveur
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/content/subjects` - Liste matières
- `GET /api/content/subjects/:slug/chapters` - Chapitres

### Protégé (JWT requis)
- `GET /api/dashboard` - Dashboard complet
- `GET /api/auth/profile` - Profil utilisateur
- `POST /api/solver/solve` - Résoudre problème
- `GET /api/content/lessons/:id` - Leçon
- `POST /api/content/lessons/:id/complete` - Compléter
- `GET /api/content/exercises/:id` - Exercice
- `POST /api/content/exercises/:id/submit` - Soumettre

---

## 🗃️ Base de Données (Prisma)

### Modèles Principaux
- **User** : Utilisateurs (xp, level, streak)
- **Subject** : Matières scientifiques
- **Chapter** : Chapitres par niveau
- **Lesson** : Leçons avec contenu Markdown
- **Exercise** : Exercices avec correction
- **LessonCompletion** : Suivi leçons
- **ExerciseAttempt** : Tentatives exercices
- **Problem** : Problèmes AI Solver
- **Quiz** : Quiz avec questions
- **Badge** : Badges gamification

---

## 🧪 Tests

### Test complet des APIs
```bash
cd backend
node test-all-apis.js
```

### Test du Dashboard
```bash
cd backend
node test-dashboard.js
```

### Test Login simple
```bash
cd backend
node test-login.js
```

---

## 🎨 Technologies

### Backend
- **Express.js** : Framework web
- **Prisma** : ORM
- **PostgreSQL** : Base de données
- **JWT** : Authentification
- **Gemini AI** : Résolution de problèmes
- **Winston** : Logging
- **Helmet** : Sécurité

### Frontend
- **React 18** : UI Library
- **Vite** : Build tool
- **Tailwind CSS** : Styling
- **React Router** : Navigation
- **Lucide React** : Icons
- **React Markdown** : Rendu Markdown

---

## 📖 Documentation

- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Guide de test complet
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) - État du projet
- [`backend/SETUP_GUIDE.md`](./backend/SETUP_GUIDE.md) - Configuration backend
- [`backend/SUPABASE_SETUP.md`](./backend/SUPABASE_SETUP.md) - Configuration Supabase

---

## 🔐 Variables d'Environnement

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://localhost:3002,http://localhost:5173"
```

---

## 👥 Équipe

Développé avec ❤️ par l'équipe Koundoul

---

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE)

---

## 🎯 Vision

**Koundoul** vise à devenir la plateforme de référence pour l'apprentissage scientifique en Afrique francophone, en combinant :
- 📚 Contenu pédagogique de qualité
- 🤖 Intelligence artificielle
- 🎮 Gamification
- 📊 Analytics de progression
- 🌍 Accessibilité maximale

---

**Bon apprentissage !** 🚀✨
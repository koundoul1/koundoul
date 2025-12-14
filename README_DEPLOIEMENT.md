# 🚀 Guide de Déploiement - Koundoul

Guide complet pour déployer Koundoul sur **Vercel** (Frontend) + **Render** (Backend) + **Supabase** (Database).

**Date** : 2025-12-06  
**Version** : 1.0

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Architecture du déploiement](#architecture-du-déploiement)
3. [Étape 1 : Préparation GitHub](#étape-1--préparation-github)
4. [Étape 2 : Déploiement Backend sur Render](#étape-2--déploiement-backend-sur-render)
5. [Étape 3 : Déploiement Frontend sur Vercel](#étape-3--déploiement-frontend-sur-vercel)
6. [Étape 4 : Configuration finale](#étape-4--configuration-finale)
7. [Tests et validation](#tests-et-validation)
8. [Troubleshooting](#troubleshooting)

---

## 📦 PRÉREQUIS

### Comptes nécessaires
- ✅ Compte **GitHub** (avec accès pour créer des repositories)
- ✅ Compte **Supabase** (déjà configuré)
- ✅ Compte **Render** (gratuit disponible)
- ✅ Compte **Vercel** (gratuit disponible)

### Informations requises
- ✅ Credentials Supabase (voir `IDENTIFIANTS_KOUNDOUL.md`)
- ✅ Nom d'utilisateur GitHub : **koundoul1**
- ✅ Clé API Google Gemini (déjà configurée)

---

## 🏗️ ARCHITECTURE DU DÉPLOIEMENT

```
┌─────────────────┐
│   Vercel        │  Frontend React
│   (Frontend)    │  https://koundoul-frontend.vercel.app
└────────┬────────┘
         │ HTTPS
         │ API Calls
         ▼
┌─────────────────┐
│   Render        │  Backend Node.js
│   (Backend)     │  https://koundoul-backend.onrender.com
└────────┬────────┘
         │ PostgreSQL
         │ (Session Pooler)
         ▼
┌─────────────────┐
│   Supabase      │  Database PostgreSQL
│   (Database)    │  wnbkplyerizogmufatxb.supabase.co
└─────────────────┘
```

---

## 📝 ÉTAPE 1 : PRÉPARATION GITHUB

### 1.1 Créer deux repositories séparés

#### Repository 1 : Backend
1. Aller sur [GitHub](https://github.com/new)
2. Créer un nouveau repository :
   - **Nom** : `koundoul-backend`
   - **Description** : "Backend API for Koundoul"
   - **Visibilité** : Public ou Private (selon préférence)
   - **NE PAS** initialiser avec README, .gitignore, ou licence

#### Repository 2 : Frontend
1. Créer un nouveau repository :
   - **Nom** : `koundoul-frontend`
   - **Description** : "Frontend React for Koundoul"
   - **Visibilité** : Public ou Private
   - **NE PAS** initialiser avec README, .gitignore, ou licence

### 1.2 Préparer le code backend

```bash
# Dans le dossier backend/
cd backend

# Vérifier que .gitignore existe
# (déjà présent selon l'analyse)

# Initialiser Git si nécessaire
git init

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Backend ready for Render deployment"

# Ajouter le remote GitHub
git remote add origin https://github.com/koundoul1/koundoul-backend.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### 1.3 Préparer le code frontend

```bash
# Dans le dossier frontend/
cd frontend

# Vérifier que .gitignore existe
# (déjà présent selon l'analyse)

# Initialiser Git si nécessaire
git init

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Frontend ready for Vercel deployment"

# Ajouter le remote GitHub
git remote add origin https://github.com/koundoul1/koundoul-frontend.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### 1.4 Vérifications

- ✅ Les deux repositories sont créés sur GitHub
- ✅ Le code est poussé dans chaque repository
- ✅ Les fichiers `.env` sont dans `.gitignore` (ne pas être commités)
- ✅ Les `README.md` sont présents dans chaque repo

---

## 🚀 ÉTAPE 2 : DÉPLOIEMENT BACKEND SUR RENDER

### 2.1 Créer un nouveau Web Service sur Render

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter votre compte GitHub si ce n'est pas déjà fait
4. Sélectionner le repository **`koundoul-backend`**

### 2.2 Configuration du service

#### Informations de base
- **Name** : `koundoul-backend`
- **Region** : **Europe (Frankfurt)** - Recommandé pour proximité Supabase
- **Branch** : `main`
- **Root Directory** : (laisser vide, racine du repo)

#### Build & Deploy
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server.js`

#### Plan
- **Free** : Gratuit (avec limitations)
- **Starter** : $7/mois (recommandé pour production)

### 2.3 Variables d'environnement

Cliquer sur **"Environment"** et ajouter :

```env
# Environnement
NODE_ENV=production
PORT=10000

# Base de données (Session Pooler - IMPORTANT : port 5432)
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# Authentification
JWT_SECRET=[GÉNÉRER UN SECRET SÉCURISÉ - voir ci-dessous]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS (À METTRE À JOUR APRÈS DÉPLOIEMENT FRONTEND)
CORS_ORIGIN=https://koundoul-frontend.vercel.app
FRONTEND_URL=https://koundoul-frontend.vercel.app

# Google AI (Gemini)
GOOGLE_AI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
GOOGLE_AI_MODEL=gemini-pro

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Générer un JWT_SECRET sécurisé

```bash
# Option 1 : En ligne de commande
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2 : En ligne
# Aller sur https://randomkeygen.com/ et utiliser "CodeIgniter Encryption Keys"
```

⚠️ **IMPORTANT** : 
- Utiliser le **Session Pooler** (port 5432) et NON le Transaction Pooler (6543)
- Le format est : `postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres`

### 2.4 Déployer

1. Cliquer sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner le repository
   - Exécuter `npm install`
   - Démarrer le serveur avec `node server.js`
3. Attendre la fin du déploiement (2-5 minutes)

### 2.5 Vérifier le déploiement

Une fois déployé, Render affichera une URL comme :
```
https://koundoul-backend.onrender.com
```

#### Tests à effectuer :

1. **Health Check** :
   ```bash
   curl https://koundoul-backend.onrender.com/health
   ```
   Devrait retourner : `{"success":true,"message":"Serveur en cours d'exécution",...}`

2. **Documentation API** :
   ```
   https://koundoul-backend.onrender.com/api/docs
   ```

3. **Vérifier les logs Render** :
   - Aller dans **"Logs"** sur Render
   - Vérifier qu'il n'y a pas d'erreurs
   - Vérifier : `✅ Base de données connectée`
   - Vérifier : `🚀 Serveur Koundoul démarré !`

### 2.6 Copier l'URL du backend

⚠️ **IMPORTANT** : Copier l'URL complète du backend Render, elle sera nécessaire pour l'étape suivante.

---

## 🌐 ÉTAPE 3 : DÉPLOIEMENT FRONTEND SUR VERCEL

### 3.1 Importer le projet

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquer sur **"Add New..."** → **"Project"**
3. Connecter votre compte GitHub si ce n'est pas déjà fait
4. Sélectionner le repository **`koundoul-frontend`**

### 3.2 Configuration du projet

#### Framework Preset
- **Framework Preset** : **Vite** (détecté automatiquement)

#### Build Settings
- **Root Directory** : (laisser vide, racine du repo)
- **Build Command** : `npm run build` ✅ (détecté automatiquement)
- **Output Directory** : `dist` ✅ (détecté automatiquement)
- **Install Command** : `npm install` ✅ (détecté automatiquement)

### 3.3 Variables d'environnement

Cliquer sur **"Environment Variables"** et ajouter :

```env
VITE_API_URL=https://koundoul-backend.onrender.com
```

⚠️ **Remplacer** `https://koundoul-backend.onrender.com` par l'URL réelle de votre backend Render (de l'étape 2.6).

### 3.4 Déployer

1. Cliquer sur **"Deploy"**
2. Vercel va automatiquement :
   - Cloner le repository
   - Installer les dépendances (`npm install`)
   - Builder le projet (`npm run build`)
   - Déployer sur leur CDN
3. Attendre la fin du déploiement (1-3 minutes)

### 3.5 Vérifier le déploiement

Une fois déployé, Vercel affichera une URL comme :
```
https://koundoul-frontend.vercel.app
```

#### Tests à effectuer :

1. **Page d'accueil** :
   - Ouvrir l'URL Vercel dans le navigateur
   - Vérifier que la page se charge correctement

2. **Connexion au backend** :
   - Ouvrir la console du navigateur (F12)
   - Vérifier qu'il n'y a pas d'erreurs CORS
   - Tester une fonctionnalité qui appelle l'API

---

## 🔧 ÉTAPE 4 : CONFIGURATION FINALE

### 4.1 Mettre à jour CORS dans Render

Maintenant que vous avez l'URL Vercel, il faut mettre à jour les variables d'environnement Render :

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionner le service **`koundoul-backend`**
3. Aller dans **"Environment"**
4. Mettre à jour :
   ```env
   CORS_ORIGIN=https://koundoul-frontend.vercel.app
   FRONTEND_URL=https://koundoul-frontend.vercel.app
   ```
5. Cliquer sur **"Save Changes"**
6. Render va redéployer automatiquement

### 4.2 Vérifier la configuration

#### Backend (Render)
- ✅ Variables d'environnement configurées
- ✅ CORS mis à jour avec URL Vercel
- ✅ Health check fonctionne

#### Frontend (Vercel)
- ✅ Variable `VITE_API_URL` configurée avec URL Render
- ✅ Build réussi
- ✅ Page se charge correctement

---

## ✅ TESTS ET VALIDATION

### Tests backend

```bash
# 1. Health Check
curl https://koundoul-backend.onrender.com/health

# 2. Documentation API
curl https://koundoul-backend.onrender.com/api/docs

# 3. Test CORS (depuis le frontend)
# Ouvrir la console du navigateur sur Vercel
# Vérifier qu'il n'y a pas d'erreurs CORS
```

### Tests frontend

1. **Page d'accueil** : Se charge correctement
2. **Connexion API** : Les appels API fonctionnent
3. **Authentification** : Créer un compte / Se connecter
4. **Fonctionnalités** : Tester les fonctionnalités principales

### Tests end-to-end

1. ✅ Créer un compte utilisateur
2. ✅ Se connecter
3. ✅ Utiliser le résolveur de problèmes
4. ✅ Faire un quiz
5. ✅ Vérifier le dashboard

---

## 🐛 TROUBLESHOOTING

### Problème : Backend ne démarre pas sur Render

**Symptômes** :
- Erreur dans les logs Render
- Health check retourne une erreur

**Solutions** :
1. Vérifier que le port est bien `10000` (ou celui configuré)
2. Vérifier que `DATABASE_URL` utilise le **Session Pooler** (port 5432)
3. Vérifier les logs Render pour les erreurs spécifiques
4. Vérifier que `JWT_SECRET` est configuré

### Problème : Erreur CORS

**Symptômes** :
- Erreur dans la console du navigateur : `CORS policy`
- Les appels API échouent

**Solutions** :
1. Vérifier que `CORS_ORIGIN` dans Render contient l'URL Vercel exacte
2. Vérifier qu'il n'y a pas d'espace dans l'URL
3. Redéployer le backend après modification de CORS
4. Vérifier que l'URL Vercel est bien en HTTPS

### Problème : Frontend ne se connecte pas au backend

**Symptômes** :
- Erreur `Failed to fetch` dans la console
- Les appels API échouent

**Solutions** :
1. Vérifier que `VITE_API_URL` dans Vercel est correcte
2. Vérifier que l'URL ne se termine pas par `/api` (ajouté automatiquement)
3. Vérifier que le backend est bien déployé et accessible
4. Redéployer le frontend après modification de `VITE_API_URL`

### Problème : Erreur de connexion à la base de données

**Symptômes** :
- Erreur dans les logs Render : `Database connection failed`
- Health check retourne `unhealthy`

**Solutions** :
1. Vérifier que `DATABASE_URL` utilise le **Session Pooler** (port 5432)
2. Vérifier que le mot de passe est correct
3. Vérifier que le Project Reference est correct dans l'URL
4. Vérifier que la région dans l'URL correspond à votre projet Supabase

### Problème : Build échoue sur Vercel

**Symptômes** :
- Build échoue avec erreur
- Déploiement annulé

**Solutions** :
1. Vérifier les logs de build Vercel
2. Vérifier que toutes les dépendances sont dans `package.json`
3. Vérifier que le Node.js version est compatible
4. Tester le build localement : `npm run build`

---

## 📚 RESSOURCES UTILES

### Documentation officielle
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Liens du projet
- Backend Render : `https://dashboard.render.com/web/[SERVICE_ID]`
- Frontend Vercel : `https://vercel.com/koundoul1/koundoul-frontend`
- Supabase Dashboard : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb`

### Fichiers de référence
- `IDENTIFIANTS_KOUNDOUL.md` - Tous les credentials
- `RAPPORT_ANALYSE_DEPLOIEMENT.md` - Analyse complète du projet
- `backend/README.md` - Documentation backend
- `frontend/README.md` - Documentation frontend

---

## ✅ CHECKLIST FINALE

### Backend (Render)
- [ ] Service créé et déployé
- [ ] Variables d'environnement configurées
- [ ] Health check fonctionne (`/health`)
- [ ] CORS configuré avec URL Vercel
- [ ] Logs sans erreurs
- [ ] URL backend copiée

### Frontend (Vercel)
- [ ] Projet importé et déployé
- [ ] Variable `VITE_API_URL` configurée
- [ ] Build réussi
- [ ] Page se charge correctement
- [ ] Connexion au backend fonctionne
- [ ] URL frontend copiée

### Configuration finale
- [ ] CORS mis à jour dans Render avec URL Vercel
- [ ] Tests end-to-end réussis
- [ ] `IDENTIFIANTS_KOUNDOUL.md` mis à jour avec URLs réelles
- [ ] Documentation complète

---

## 🎉 FÉLICITATIONS !

Votre application Koundoul est maintenant déployée en production ! 🚀

**URLs de production** :
- Frontend : `https://koundoul-frontend.vercel.app`
- Backend : `https://koundoul-backend.onrender.com`
- Database : `wnbkplyerizogmufatxb.supabase.co`

---

**Dernière mise à jour** : 2025-12-06  
**Version** : 1.0  
**Statut** : ✅ Prêt pour déploiement


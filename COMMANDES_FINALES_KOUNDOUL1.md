# 🚀 COMMANDES FINALES POUR DÉPLOIEMENT KOUNDOUL
## Nom d'utilisateur GitHub : koundoul1

**Toutes les commandes sont prêtes à copier-coller !**

---

## 📋 ÉTAPE 1 : CRÉER LES REPOSITORIES SUR GITHUB

### Ouvrir dans le navigateur et créer :

1. **Backend** : https://github.com/new
   - Repository name : `koundoul-backend`
   - Description : "Backend API for Koundoul"
   - Visibilité : Public ou Private
   - **NE PAS** cocher "Add a README file"
   - Cliquer sur "Create repository"

2. **Frontend** : https://github.com/new
   - Repository name : `koundoul-frontend`
   - Description : "Frontend React for Koundoul"
   - Visibilité : Public ou Private
   - **NE PAS** cocher "Add a README file"
   - Cliquer sur "Create repository"

---

## 📦 ÉTAPE 2 : PRÉPARER ET POUSSER LE CODE

### Option A : Utiliser le script automatique (RECOMMANDÉ)

```powershell
.\PREPARER-REPOS-GITHUB.ps1
```

Le script va automatiquement :
- Initialiser les repos Git
- Créer les commits
- Afficher les commandes pour pousser sur GitHub

### Option B : Commandes manuelles

#### Backend
```powershell
cd backend
git init
git add .
git commit -m "Initial commit - Backend ready for Render deployment"
git remote add origin https://github.com/koundoul1/koundoul-backend.git
git branch -M main
git push -u origin main
```

#### Frontend
```powershell
cd frontend
git init
git add .
git commit -m "Initial commit - Frontend ready for Vercel deployment"
git remote add origin https://github.com/koundoul1/koundoul-frontend.git
git branch -M main
git push -u origin main
```

---

## 🔐 ÉTAPE 3 : GÉNÉRER JWT_SECRET

```powershell
.\GENERER-JWT-SECRET.ps1
```

**OU** avec Node.js :
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copier le résultat** pour l'étape suivante.

---

## 🚀 ÉTAPE 4 : DÉPLOIEMENT BACKEND SUR RENDER

### 4.1 Créer le service

1. Aller sur : https://dashboard.render.com
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter GitHub si nécessaire
4. Sélectionner le repository **`koundoul-backend`**

### 4.2 Configuration

- **Name** : `koundoul-backend`
- **Region** : **Europe (Frankfurt)**
- **Branch** : `main`
- **Root Directory** : (vide)
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server.js`
- **Plan** : Free ou Starter

### 4.3 Variables d'environnement

Cliquer sur **"Environment"** et ajouter :

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
JWT_SECRET=[COLLER_LE_JWT_SECRET_GÉNÉRÉ_À_L_ÉTAPE_3]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://koundoul-frontend.vercel.app
FRONTEND_URL=https://koundoul-frontend.vercel.app
GOOGLE_AI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
GOOGLE_AI_MODEL=gemini-pro
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4.4 Déployer

1. Cliquer sur **"Create Web Service"**
2. Attendre 2-5 minutes
3. **Copier l'URL** générée (ex: `https://koundoul-backend.onrender.com`)

### 4.5 Tester

```powershell
# Test health check
curl https://koundoul-backend.onrender.com/health

# Ou ouvrir dans le navigateur
start https://koundoul-backend.onrender.com/health
```

---

## 🌐 ÉTAPE 5 : DÉPLOIEMENT FRONTEND SUR VERCEL

### 5.1 Importer le projet

1. Aller sur : https://vercel.com/dashboard
2. Cliquer sur **"Add New..."** → **"Project"**
3. Connecter GitHub si nécessaire
4. Sélectionner le repository **`koundoul-frontend`**

### 5.2 Configuration

- **Framework Preset** : Vite (détecté automatiquement)
- **Root Directory** : (vide)
- **Build Command** : `npm run build` (détecté)
- **Output Directory** : `dist` (détecté)
- **Install Command** : `npm install` (détecté)

### 5.3 Variables d'environnement

Cliquer sur **"Environment Variables"** et ajouter :

```env
VITE_API_URL=https://koundoul-backend.onrender.com
```

⚠️ **Remplacer** `https://koundoul-backend.onrender.com` par l'URL réelle de votre backend Render.

### 5.4 Déployer

1. Cliquer sur **"Deploy"**
2. Attendre 1-3 minutes
3. **Copier l'URL** générée (ex: `https://koundoul-frontend.vercel.app`)

---

## 🔧 ÉTAPE 6 : CONFIGURATION FINALE

### 6.1 Mettre à jour CORS dans Render

1. Aller sur : https://dashboard.render.com
2. Sélectionner **`koundoul-backend`**
3. Aller dans **"Environment"**
4. Mettre à jour :
   ```env
   CORS_ORIGIN=https://koundoul-frontend.vercel.app
   FRONTEND_URL=https://koundoul-frontend.vercel.app
   ```
5. Cliquer sur **"Save Changes"**
6. Render redéploiera automatiquement

### 6.2 Tester

**Backend** :
```powershell
curl https://koundoul-backend.onrender.com/health
```

**Frontend** :
- Ouvrir l'URL Vercel
- Tester une fonctionnalité
- Vérifier qu'il n'y a pas d'erreurs CORS

---

## ✅ RÉSUMÉ DES URLS

Après déploiement, vous aurez :

- **Backend Render** : `https://koundoul-backend.onrender.com`
- **Frontend Vercel** : `https://koundoul-frontend.vercel.app`
- **Database Supabase** : `wnbkplyerizogmufatxb.supabase.co`

---

## 📝 CHECKLIST

- [ ] Repositories GitHub créés (`koundoul-backend` et `koundoul-frontend`)
- [ ] Code poussé sur GitHub
- [ ] JWT_SECRET généré
- [ ] Backend déployé sur Render
- [ ] URL backend copiée
- [ ] Frontend déployé sur Vercel
- [ ] URL frontend copiée
- [ ] CORS mis à jour dans Render
- [ ] Tests de validation réussis

---

## 🎯 COMMANDES RAPIDES

### Tout préparer automatiquement
```powershell
.\DEPLOIEMENT-AUTOMATIQUE.ps1
```

### Préparer les repos Git
```powershell
.\PREPARER-REPOS-GITHUB.ps1
```

### Générer JWT_SECRET
```powershell
.\GENERER-JWT-SECRET.ps1
```

---

**Temps estimé** : 15-30 minutes  
**Statut** : ✅ Prêt à déployer !






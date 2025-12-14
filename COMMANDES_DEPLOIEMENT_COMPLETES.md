# 🚀 COMMANDES COMPLÈTES POUR DÉPLOIEMENT KOUNDOUL

**Guide rapide avec toutes les commandes à exécuter**

---

## 📋 ÉTAPE 1 : PRÉPARATION GITHUB

### 1.1 Créer les repositories sur GitHub

**Ouvrir dans le navigateur** :
1. https://github.com/new → Créer `koundoul-backend` (sans README)
2. https://github.com/new → Créer `koundoul-frontend` (sans README)

### 1.2 Préparer et pousser le code

**Option A : Utiliser le script PowerShell** (recommandé)
```powershell
.\PREPARER-REPOS-GITHUB.ps1
```

**Option B : Commandes manuelles**

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

## 🔐 ÉTAPE 2 : GÉNÉRER JWT_SECRET

**Option A : Utiliser le script PowerShell**
```powershell
.\GENERER-JWT-SECRET.ps1
```

**Option B : Commande Node.js**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copier le résultat** pour l'étape suivante.

---

## 🚀 ÉTAPE 3 : DÉPLOIEMENT BACKEND SUR RENDER

### 3.1 Créer le service sur Render

1. Aller sur : https://dashboard.render.com
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter GitHub si nécessaire
4. Sélectionner le repository **`koundoul-backend`**

### 3.2 Configuration Render

**Name** : `koundoul-backend`  
**Region** : **Europe (Frankfurt)**  
**Branch** : `main`  
**Root Directory** : (vide)  
**Runtime** : `Node`  
**Build Command** : `npm install`  
**Start Command** : `node server.js`  
**Plan** : Free ou Starter

### 3.3 Variables d'environnement Render

Cliquer sur **"Environment"** et ajouter :

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
JWT_SECRET=[COLLER_LE_JWT_SECRET_GÉNÉRÉ]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://koundoul-frontend.vercel.app
FRONTEND_URL=https://koundoul-frontend.vercel.app
GOOGLE_AI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
GOOGLE_AI_MODEL=gemini-pro
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **IMPORTANT** :
- Remplacer `[COLLER_LE_JWT_SECRET_GÉNÉRÉ]` par le secret généré à l'étape 2
- L'URL `CORS_ORIGIN` sera mise à jour après le déploiement Vercel

### 3.4 Déployer

1. Cliquer sur **"Create Web Service"**
2. Attendre la fin du déploiement (2-5 minutes)
3. **Copier l'URL** générée (ex: `https://koundoul-backend.onrender.com`)

### 3.5 Tester le backend

```powershell
# Test health check
curl https://koundoul-backend.onrender.com/health

# Ou ouvrir dans le navigateur
start https://koundoul-backend.onrender.com/health
```

---

## 🌐 ÉTAPE 4 : DÉPLOIEMENT FRONTEND SUR VERCEL

### 4.1 Importer le projet sur Vercel

1. Aller sur : https://vercel.com/dashboard
2. Cliquer sur **"Add New..."** → **"Project"**
3. Connecter GitHub si nécessaire
4. Sélectionner le repository **`koundoul-frontend`**

### 4.2 Configuration Vercel

**Framework Preset** : Vite (détecté automatiquement)  
**Root Directory** : (vide)  
**Build Command** : `npm run build` (détecté)  
**Output Directory** : `dist` (détecté)  
**Install Command** : `npm install` (détecté)

### 4.3 Variables d'environnement Vercel

Cliquer sur **"Environment Variables"** et ajouter :

```env
VITE_API_URL=https://koundoul-backend.onrender.com
```

⚠️ **Remplacer** `https://koundoul-backend.onrender.com` par l'URL réelle de votre backend Render (de l'étape 3.4).

### 4.4 Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du déploiement (1-3 minutes)
3. **Copier l'URL** générée (ex: `https://koundoul-frontend.vercel.app`)

### 4.5 Tester le frontend

Ouvrir l'URL Vercel dans le navigateur et vérifier :
- La page se charge
- Pas d'erreurs dans la console (F12)
- Les appels API fonctionnent

---

## 🔧 ÉTAPE 5 : CONFIGURATION FINALE

### 5.1 Mettre à jour CORS dans Render

1. Aller sur : https://dashboard.render.com
2. Sélectionner le service **`koundoul-backend`**
3. Aller dans **"Environment"**
4. Mettre à jour :
   ```env
   CORS_ORIGIN=https://koundoul-frontend.vercel.app
   FRONTEND_URL=https://koundoul-frontend.vercel.app
   ```
5. Cliquer sur **"Save Changes"**
6. Render redéploiera automatiquement

### 5.2 Vérifier la configuration

**Backend** :
```powershell
curl https://koundoul-backend.onrender.com/health
```

**Frontend** :
- Ouvrir l'URL Vercel
- Tester une fonctionnalité (login, etc.)
- Vérifier qu'il n'y a pas d'erreurs CORS

---

## ✅ TESTS FINAUX

### Test 1 : Health Check Backend
```powershell
curl https://koundoul-backend.onrender.com/health
```
**Résultat attendu** : `{"success":true,"message":"Serveur en cours d'exécution",...}`

### Test 2 : Documentation API
```
https://koundoul-backend.onrender.com/api/docs
```
**Résultat attendu** : JSON avec la documentation de l'API

### Test 3 : Frontend → Backend
1. Ouvrir l'URL Vercel
2. Ouvrir la console (F12)
3. Vérifier qu'il n'y a pas d'erreurs CORS
4. Tester une fonctionnalité qui appelle l'API

### Test 4 : End-to-End
1. Créer un compte utilisateur
2. Se connecter
3. Utiliser le résolveur de problèmes
4. Faire un quiz

---

## 📝 MISE À JOUR DES IDENTIFIANTS

Après déploiement, mettre à jour `IDENTIFIANTS_KOUNDOUL.md` avec :
- URL Render réelle
- URL Vercel réelle
- JWT_SECRET utilisé

---

## 🐛 TROUBLESHOOTING RAPIDE

### Backend ne démarre pas
- Vérifier les logs Render
- Vérifier que `DATABASE_URL` utilise le port **5432** (Session Pooler)
- Vérifier que `JWT_SECRET` est configuré

### Erreur CORS
- Vérifier que `CORS_ORIGIN` dans Render contient l'URL Vercel exacte
- Redéployer le backend après modification

### Frontend ne se connecte pas au backend
- Vérifier que `VITE_API_URL` dans Vercel est correcte
- Vérifier que l'URL ne se termine pas par `/api` (ajouté automatiquement)
- Redéployer le frontend après modification

### Erreur de connexion à la base de données
- Vérifier que `DATABASE_URL` utilise le **Session Pooler** (port 5432)
- Vérifier le mot de passe
- Vérifier le Project Reference dans l'URL

---

## 📚 LIENS UTILES

- **Render Dashboard** : https://dashboard.render.com
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Supabase Dashboard** : https://supabase.com/dashboard/project/wnbkplyerizogmufatxb
- **GitHub** : https://github.com

---

## ✅ CHECKLIST FINALE

- [ ] Repositories GitHub créés
- [ ] Code poussé sur GitHub
- [ ] JWT_SECRET généré
- [ ] Backend déployé sur Render
- [ ] URL backend copiée
- [ ] Frontend déployé sur Vercel
- [ ] URL frontend copiée
- [ ] CORS mis à jour dans Render
- [ ] Tests de validation réussis
- [ ] `IDENTIFIANTS_KOUNDOUL.md` mis à jour

---

**Temps estimé total** : 15-30 minutes  
**Statut** : ✅ Prêt à exécuter


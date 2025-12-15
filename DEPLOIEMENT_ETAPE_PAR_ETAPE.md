# 🚀 Déploiement Étape par Étape - Koundoul

## ✅ Prérequis

- ✅ Code poussé sur GitHub : https://github.com/koundoul1/koundoul
- ✅ Compte Vercel (gratuit) : https://vercel.com
- ✅ Compte Render (gratuit) : https://render.com
- ✅ Compte Supabase (gratuit) : https://supabase.com

---

## 📱 ÉTAPE 1 : Déployer le Backend sur Render

### 1.1 Créer le service sur Render

1. Allez sur [render.com](https://render.com)
2. Connectez-vous ou créez un compte (gratuit)
3. Cliquez sur **"New +"** en haut à droite
4. Sélectionnez **"Web Service"**

### 1.2 Connecter le dépôt GitHub

1. Cliquez sur **"Connect account"** si ce n'est pas déjà fait
2. Autorisez Render à accéder à votre GitHub
3. Sélectionnez le dépôt **`koundoul`**

### 1.3 Configurer le service

Remplissez les champs suivants :

- **Name** : `koundoul-backend`
- **Region** : `Europe (Frankfurt)` ou le plus proche
- **Branch** : `main`
- **Root Directory** : `backend` ⚠️ **IMPORTANT**
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`

### 1.4 Ajouter les variables d'environnement

Cliquez sur **"Advanced"** → **"Add Environment Variable"** et ajoutez :

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
JWT_SECRET=votre_cle_secrete_jwt_minimum_32_caracteres_ici
CORS_ORIGIN=https://koundoul-frontend.vercel.app
```

⚠️ **Important** :
- Remplacez `JWT_SECRET` par une clé secrète forte (minimum 32 caractères)
- Vous pouvez générer une clé avec : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 1.5 Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez que le build se termine (5-10 minutes)
3. Notez l'URL du service : `https://koundoul-backend.onrender.com` (ou similaire)

---

## 🌐 ÉTAPE 2 : Déployer le Frontend sur Vercel

### 2.1 Créer le projet sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous ou créez un compte (gratuit)
3. Cliquez sur **"Add New Project"**
4. Importez le dépôt **`koundoul`**

### 2.2 Configurer le projet

Remplissez les champs suivants :

- **Project Name** : `koundoul-frontend` (ou laissez par défaut)
- **Framework Preset** : `Vite` (détecté automatiquement)
- **Root Directory** : `frontend` ⚠️ **IMPORTANT**
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `dist` (par défaut)

### 2.3 Ajouter les variables d'environnement

Cliquez sur **"Environment Variables"** et ajoutez :

```
VITE_API_URL=https://koundoul-backend.onrender.com
```

⚠️ Remplacez `https://koundoul-backend.onrender.com` par l'URL réelle de votre backend Render (de l'étape 1.5)

### 2.4 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (2-5 minutes)
3. Votre site sera accessible à : `https://koundoul-frontend.vercel.app` (ou similaire)

---

## 🔄 ÉTAPE 3 : Mettre à jour les URLs

### 3.1 Mettre à jour CORS dans Render

Une fois le frontend déployé :

1. Retournez sur Render → votre service backend
2. Allez dans **"Environment"**
3. Modifiez `CORS_ORIGIN` avec l'URL réelle de Vercel :
   ```
   CORS_ORIGIN=https://koundoul-frontend.vercel.app
   ```
4. Cliquez sur **"Save Changes"** (le service redémarrera automatiquement)

### 3.2 Mettre à jour l'URL API dans Vercel

1. Retournez sur Vercel → votre projet frontend
2. Allez dans **"Settings"** → **"Environment Variables"**
3. Modifiez `VITE_API_URL` avec l'URL réelle de Render
4. Cliquez sur **"Save"**
5. Allez dans **"Deployments"** → **"Redeploy"** (ou faites un nouveau commit)

---

## ✅ Vérification

### Backend
- ✅ Service Render actif et accessible
- ✅ Health check : `https://votre-backend.onrender.com/api/health`
- ✅ Variables d'environnement configurées

### Frontend
- ✅ Site Vercel déployé et accessible
- ✅ Variable `VITE_API_URL` configurée
- ✅ Connexion au backend fonctionnelle

---

## 🔗 URLs de production

Une fois tout déployé :

- **Frontend** : `https://koundoul-frontend.vercel.app`
- **Backend** : `https://koundoul-backend.onrender.com`
- **API Health** : `https://koundoul-backend.onrender.com/api/health`

---

## 🐛 Résolution de problèmes

### Backend ne démarre pas sur Render
- Vérifiez les logs dans Render → Logs
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que `JWT_SECRET` est défini

### Frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` est correct dans Vercel
- Vérifiez que `CORS_ORIGIN` dans Render correspond à l'URL Vercel
- Vérifiez la console du navigateur pour les erreurs CORS

### Erreur 404 sur Vercel
- Vérifiez que `vercel.json` est présent dans `frontend/`
- Vérifiez que le build génère bien le dossier `dist/`

---

## 📝 Checklist finale

- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] URLs mises à jour
- [ ] Application accessible et fonctionnelle
- [ ] Tests de connexion frontend ↔ backend réussis

---

**🎉 Félicitations ! Votre application est maintenant en production !**

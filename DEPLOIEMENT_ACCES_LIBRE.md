# 🚀 Déploiement - Accès libre sans inscription

## ✅ Modifications effectuées

Les modifications suivantes ont été apportées pour permettre l'accès à l'application sans inscription :

### Frontend
- **`frontend/src/components/ProtectedRoute.jsx`** : Modifié pour permettre l'accès sans authentification

### Backend
- **`backend/src/modules/quiz/quiz.routes.js`** : Routes avec authentification optionnelle
- **`backend/src/modules/quiz/quiz.controller.js`** : Gestion du mode invité
- **`backend/src/modules/content/content.routes.js`** : Routes avec authentification optionnelle
- **`backend/src/modules/content/content.controller.js`** : Gestion du mode invité

## 📦 Commit créé

Le commit a été créé avec le message :
```
feat: Débloquer l'application sans inscription - Accès libre aux fonctionnalités principales
```

## 🔗 Configuration Git pour déploiement

### 1. Créer un dépôt GitHub (si pas déjà fait)

```bash
# Créer un nouveau dépôt sur GitHub
# Puis ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/koundoul.git
```

### 2. Pousser vers GitHub

```bash
git branch -M main
git push -u origin main
```

## 🌐 Déploiement sur Vercel (Frontend)

### Option 1 : Via GitHub (Recommandé)

1. Connectez-vous à [Vercel](https://vercel.com)
2. Importez votre projet depuis GitHub
3. Sélectionnez le dossier `frontend`
4. Configurez les variables d'environnement :
   - `VITE_API_URL` : URL de votre backend Render

### Option 2 : Via CLI Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 🖥️ Déploiement sur Render (Backend)

### Via Dashboard Render

1. Connectez-vous à [Render](https://render.com)
2. Créez un nouveau "Web Service"
3. Connectez votre dépôt GitHub
4. Sélectionnez le dossier `backend`
5. Configurez :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment** : `Node`

### Variables d'environnement à configurer sur Render

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=votre_connection_string_supabase
JWT_SECRET=votre_jwt_secret
```

## 🔄 Déploiement automatique

Une fois configuré :
- **Vercel** : Déploie automatiquement à chaque push sur `main` dans le dossier `frontend`
- **Render** : Déploie automatiquement à chaque push sur `main` dans le dossier `backend`

## 📝 Notes importantes

1. Les utilisateurs peuvent maintenant accéder à l'application sans inscription
2. En mode invité, les résultats ne sont pas sauvegardés
3. Les fonctionnalités personnelles (profil, historique, badges) nécessitent toujours une authentification
4. Les utilisateurs sont encouragés à se connecter pour sauvegarder leurs progrès

## 🐛 Résolution des problèmes

### Si backend/frontend sont des sous-modules Git

```bash
# Supprimer les sous-modules
git rm --cached backend
git rm --cached frontend

# Supprimer les dossiers .git dans backend et frontend
Remove-Item -Recurse -Force backend\.git
Remove-Item -Recurse -Force frontend\.git

# Réajouter les fichiers
git add backend/ frontend/
git commit -m "fix: Convertir sous-modules en fichiers normaux"
git push
```

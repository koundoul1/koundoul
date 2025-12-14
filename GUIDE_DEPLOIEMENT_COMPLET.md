# 🚀 Guide de Déploiement Complet - Koundoul

## ✅ État actuel

- ✅ Tous les fichiers sont commités localement
- ✅ Branche `main` configurée
- ✅ 4 commits prêts à être poussés
- ⏳ Dépôt GitHub à créer

## 📦 Commits prêts

```
abceee3 docs: Ajouter script de push automatique vers GitHub
395a0ed feat: Ajouter tous les fichiers backend et frontend
a2dfa7a fix: Convertir sous-modules en fichiers normaux
77d96e7 feat: Débloquer l'application sans inscription
```

## 🔗 Étape 1 : Créer le dépôt GitHub

### Option A : Via l'interface web (Recommandé)

1. Allez sur [github.com/new](https://github.com/new)
2. **Repository name** : `koundoul`
3. **Description** : `Plateforme pédagogique scientifique - Mathématiques, Physique, Chimie`
4. **Visibilité** : Public ou Private (selon votre choix)
5. ⚠️ **NE COCHEZ PAS** "Add a README file" (nous avons déjà un README)
6. ⚠️ **NE COCHEZ PAS** "Add .gitignore" (nous avons déjà un .gitignore)
7. Cliquez sur **"Create repository"**

### Option B : Via GitHub CLI (si installé)

```bash
gh repo create koundoul --public --description "Plateforme pédagogique scientifique"
```

## 🚀 Étape 2 : Pousser vers GitHub

Une fois le dépôt créé, exécutez :

```powershell
cd c:\Users\conta\koundoul

# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/koundoul.git
git push -u origin main
```

**OU** utilisez le script automatique (il vous demandera l'URL) :

```powershell
.\PUSH-TO-GITHUB.ps1
```

## 🌐 Étape 3 : Déployer sur Vercel (Frontend)

### Configuration Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre dépôt GitHub `koundoul`
4. **Root Directory** : Sélectionnez `frontend`
5. **Framework Preset** : Vite (détecté automatiquement)
6. **Build Command** : `npm run build` (par défaut)
7. **Output Directory** : `dist` (par défaut)

### Variables d'environnement Vercel

Ajoutez dans les **Environment Variables** :

```
VITE_API_URL=https://koundoul-backend.onrender.com
```

(Remplacez par l'URL de votre backend Render une fois déployé)

### Déploiement

- Cliquez sur **"Deploy"**
- Vercel déploiera automatiquement à chaque push sur `main`

## 🖥️ Étape 4 : Déployer sur Render (Backend)

### Configuration Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre dépôt GitHub `koundoul`
4. **Name** : `koundoul-backend`
5. **Root Directory** : `backend`
6. **Environment** : `Node`
7. **Build Command** : `npm install`
8. **Start Command** : `npm start`

### Variables d'environnement Render

Ajoutez dans **Environment** :

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
JWT_SECRET=votre_jwt_secret_ici
CORS_ORIGIN=https://koundoul-frontend.vercel.app
```

⚠️ **Important** : Remplacez `JWT_SECRET` par une clé secrète forte (minimum 32 caractères)

### Déploiement

- Cliquez sur **"Create Web Service"**
- Render déploiera automatiquement à chaque push sur `main`

## 🔄 Déploiement automatique

Une fois configuré :

- **Vercel** : Déploie automatiquement le frontend à chaque push sur `main`
- **Render** : Déploie automatiquement le backend à chaque push sur `main`

## 📝 Checklist finale

- [ ] Dépôt GitHub créé
- [ ] Code poussé vers GitHub
- [ ] Vercel configuré pour le frontend
- [ ] Render configuré pour le backend
- [ ] Variables d'environnement configurées
- [ ] Frontend déployé et accessible
- [ ] Backend déployé et accessible
- [ ] Test de l'application en production

## 🐛 Résolution de problèmes

### Erreur "Repository not found"
- Vérifiez que le dépôt GitHub existe
- Vérifiez que vous avez les permissions d'écriture
- Vérifiez l'URL du dépôt

### Erreur d'authentification GitHub
```powershell
git config --global credential.helper manager-core
```

### Erreur de build sur Vercel
- Vérifiez que le dossier `frontend` est correctement configuré
- Vérifiez les variables d'environnement

### Erreur de build sur Render
- Vérifiez que le dossier `backend` est correctement configuré
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez les logs de build dans Render

## 📞 Support

Pour toute question, consultez :
- `DEPLOIEMENT_ACCES_LIBRE.md` - Détails sur les modifications
- `README.md` - Documentation générale du projet

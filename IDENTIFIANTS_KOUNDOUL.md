# 🔐 Identifiants Complets - Koundoul

**⚠️ FICHIER CONFIDENTIEL - NE PAS COMMITER SUR GITHUB**

**Date de création** : 2025-12-06  
**Projet** : Koundoul  
**Environnement** : Production

---

## 📊 SUPABASE

### Informations du projet
- **Project Reference** : `wnbkplyerizogmufatxb`
- **URL du projet** : `https://wnbkplyerizogmufatxb.supabase.co`
- **Dashboard** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb`
- **Région** : Europe (Nord) - `aws-1-eu-north-1`

### Credentials
- **Host (Direct)** : `db.wnbkplyerizogmufatxb.supabase.co`
- **Host (Pooler)** : `aws-1-eu-north-1.pooler.supabase.com`
- **Database** : `postgres`
- **User** : `postgres` / `postgres.wnbkplyerizogmufatxb` (pooler)
- **Password** : `atsatsATS1.ATS`
- **Port (Direct)** : `5432`
- **Port (Session Pooler)** : `5432` ✅ RECOMMANDÉ pour Render
- **Port (Transaction Pooler)** : `6543`

### Connection Strings

#### 1. Connexion directe (port 5432)
```
postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres
```

#### 2. Session Pooler (port 5432) - ✅ RECOMMANDÉ pour Render
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

#### 3. Transaction Pooler (port 6543) - Actuellement utilisé en dev
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Clés API Supabase
⚠️ **À récupérer depuis le dashboard Supabase** :
1. Aller sur : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api`
2. Copier :
   - **anon public key** : `[À RÉCUPÉRER]`
   - **service_role key** : `[À RÉCUPÉRER]`

---

## 🚀 RENDER (Backend)

### Informations du service
- **Service Type** : Web Service
- **Region** : Europe (Frankfurt) - Recommandé pour proximité Supabase
- **Instance Type** : Free ou Starter

### URL de production
```
https://koundoul-backend.onrender.com
```
⚠️ **À remplacer par l'URL réelle après déploiement**

### Variables d'environnement Render

```env
# Environnement
NODE_ENV=production
PORT=10000

# Base de données (Session Pooler - RECOMMANDÉ)
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# Authentification
JWT_SECRET=[GÉNÉRER UN SECRET SÉCURISÉ - MINIMUM 32 CARACTÈRES]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS (À METTRE À JOUR APRÈS DÉPLOIEMENT FRONTEND)
CORS_ORIGIN=https://koundoul-frontend.vercel.app
FRONTEND_URL=https://koundoul-frontend.vercel.app

# Google AI (Gemini)
GOOGLE_AI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
GOOGLE_AI_MODEL=gemini-pro

# Stripe (Optionnel)
STRIPE_SECRET_KEY=[À CONFIGURER SI NÉCESSAIRE]
STRIPE_PUBLISHABLE_KEY=[À CONFIGURER SI NÉCESSAIRE]
STRIPE_WEBHOOK_SECRET=[À CONFIGURER SI NÉCESSAIRE]

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration Render
- **Build Command** : `npm install`
- **Start Command** : `node server.js`
- **Health Check Path** : `/health`

---

## 🌐 VERCEL (Frontend)

### Informations du service
- **Framework Preset** : Vite
- **Region** : Europe (Frankfurt) - Recommandé

### URL de production
```
https://koundoul-frontend.vercel.app
```
⚠️ **À remplacer par l'URL réelle après déploiement**

### Variables d'environnement Vercel

```env
# URL de l'API Backend
VITE_API_URL=https://koundoul-backend.onrender.com
```

⚠️ **À mettre à jour après déploiement du backend**

### Configuration Vercel
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`
- **Framework** : Vite

---

## 👤 ADMIN / COMPTES DE TEST

### Compte admin (si existant)
- **Email** : `[À CONFIGURER]`
- **Password** : `[À CONFIGURER]`
- **Hash** : `[GÉNÉRÉ PAR BCRYPT]`

### Compte de test
- **Email** : `sambafaye184@yahoo.fr` (selon documentation)
- **Password** : `atsatsATS1.ATS` (selon documentation)

---

## 🔑 SECRETS & CLÉS

### JWT Secret
⚠️ **À générer un nouveau secret sécurisé pour la production** :
```bash
# Générer un secret aléatoire (32+ caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google AI (Gemini) API Key
```
AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
```

### Stripe Keys
- **Secret Key** : `[À CONFIGURER SI NÉCESSAIRE]`
- **Publishable Key** : `[À CONFIGURER SI NÉCESSAIRE]`
- **Webhook Secret** : `[À CONFIGURER SI NÉCESSAIRE]`

---

## 📋 CHECKLIST POST-DÉPLOIEMENT

### Après déploiement Render
- [ ] Tester `/health` endpoint
- [ ] Vérifier connexion base de données
- [ ] Tester une route API (ex: `/api/docs`)
- [ ] Copier l'URL Render

### Après déploiement Vercel
- [ ] Mettre à jour `VITE_API_URL` dans Vercel
- [ ] Mettre à jour `CORS_ORIGIN` dans Render avec URL Vercel
- [ ] Tester la connexion frontend → backend
- [ ] Tester l'authentification
- [ ] Copier l'URL Vercel

### Configuration finale
- [ ] Mettre à jour ce fichier avec les URLs réelles
- [ ] Vérifier que toutes les variables d'environnement sont configurées
- [ ] Tester les fonctionnalités principales
- [ ] Vérifier les logs Render et Vercel

---

## 🔗 LIENS UTILES

### Supabase
- Dashboard : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb`
- Database Settings : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/database`
- API Settings : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api`

### Render
- Dashboard : `https://dashboard.render.com`
- Service : `https://dashboard.render.com/web/[SERVICE_ID]`

### Vercel
- Dashboard : `https://vercel.com/dashboard`
- Project : `https://vercel.com/[USERNAME]/koundoul-frontend`

---

## ⚠️ SÉCURITÉ

1. **NE JAMAIS COMMITER** ce fichier sur GitHub
2. **NE JAMAIS PARTAGER** les credentials publiquement
3. **ROTATION RÉGULIÈRE** des secrets en production
4. **UTILISER** des secrets différents entre dev et prod
5. **ACTIVER** 2FA sur tous les comptes (Supabase, Render, Vercel)

---

## 📝 NOTES

- Les URLs Render et Vercel seront générées automatiquement lors du déploiement
- Mettre à jour ce fichier après chaque déploiement avec les URLs réelles
- Conserver une copie sécurisée de ce fichier (hors du repo Git)

---

**Dernière mise à jour** : 2025-12-06  
**Statut** : ⚠️ En attente de déploiement - URLs à compléter






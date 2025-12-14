# 🔍 DIAGNOSTIC DÉPLOIEMENT - KOUNDOUL

**Date** : 2025-12-06  
**Statut** : ❌ Problème détecté

---

## 🚨 QUESTIONS DE DIAGNOSTIC

Pour identifier le problème, j'ai besoin de savoir :

### 1. Quel composant ne fonctionne pas ?
- [ ] Backend (Render) ne démarre pas
- [ ] Frontend (Vercel) ne se charge pas
- [ ] Connexion frontend → backend ne fonctionne pas
- [ ] Base de données (Supabase) ne se connecte pas
- [ ] Erreurs spécifiques dans les logs

### 2. Messages d'erreur
- Quels sont les messages d'erreur exacts ?
- Dans quels logs voyez-vous les erreurs ? (Render, Vercel, console navigateur)

### 3. Où en êtes-vous dans le déploiement ?
- [ ] Backend déployé sur Render ?
- [ ] Frontend déployé sur Vercel ?
- [ ] Variables d'environnement configurées ?
- [ ] CORS configuré ?

---

## 🔧 DIAGNOSTIC RAPIDE

### Test 1 : Backend Health Check

```powershell
curl https://koundoul-backend.onrender.com/health
```

**Résultat attendu** : `{"success":true,...}`  
**Si erreur** : Voir section "Problèmes Backend" ci-dessous

### Test 2 : Frontend

Ouvrir dans le navigateur : `https://koundoul-frontend.vercel.app`

**Si erreur** : Voir section "Problèmes Frontend" ci-dessous

### Test 3 : Console Navigateur

1. Ouvrir `https://koundoul-frontend.vercel.app`
2. Ouvrir la console (F12)
3. Vérifier les erreurs

**Erreurs communes** :
- `Failed to fetch` → Problème de connexion au backend
- `CORS policy` → Problème CORS
- `404 Not Found` → Route API incorrecte

---

## 🐛 PROBLÈMES COURANTS ET SOLUTIONS

### Problème 1 : Backend ne démarre pas sur Render

#### Symptômes
- Service Render affiche "Failed" ou "Error"
- Health check retourne une erreur
- Logs Render montrent des erreurs

#### Solutions

**A. Vérifier les variables d'environnement**
1. Aller sur Render → Service → Environment
2. Vérifier que toutes les variables sont présentes :
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
   JWT_SECRET=6d1c50e3895cafea89a0095d6280fc7d49d2b79c1b9a73e81c79d21567070853
   ```

**B. Vérifier les logs Render**
1. Aller sur Render → Service → Logs
2. Chercher les erreurs spécifiques
3. Erreurs communes :
   - `Database connection failed` → Vérifier DATABASE_URL
   - `Port already in use` → Vérifier PORT=10000
   - `Module not found` → Vérifier que package.json est correct

**C. Vérifier la connection string**
- Utiliser le **Session Pooler** (port 5432) et NON le Transaction Pooler (6543)
- Format correct : `postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres`

**D. Vérifier le Start Command**
- Doit être : `node server.js`
- Pas : `npm start` ou `npm run dev`

---

### Problème 2 : Frontend ne se charge pas sur Vercel

#### Symptômes
- Page blanche
- Erreur 404
- Build échoue

#### Solutions

**A. Vérifier le build**
1. Aller sur Vercel → Project → Deployments
2. Vérifier le statut du dernier déploiement
3. Si "Failed", cliquer pour voir les logs

**B. Erreurs de build communes**
- `Module not found` → Vérifier que toutes les dépendances sont dans package.json
- `Syntax error` → Vérifier le code pour erreurs de syntaxe
- `Environment variable missing` → Vérifier VITE_API_URL

**C. Vérifier les variables d'environnement**
1. Vercel → Project → Settings → Environment Variables
2. Vérifier que `VITE_API_URL` est configuré :
   ```env
   VITE_API_URL=https://koundoul-backend.onrender.com
   ```

**D. Vérifier la configuration**
- Build Command : `npm run build`
- Output Directory : `dist`
- Framework : Vite

---

### Problème 3 : Erreur CORS

#### Symptômes
- Erreur dans la console : `CORS policy: No 'Access-Control-Allow-Origin' header`
- Les appels API échouent

#### Solutions

**A. Vérifier CORS_ORIGIN dans Render**
1. Render → Service → Environment
2. Vérifier `CORS_ORIGIN` :
   ```env
   CORS_ORIGIN=https://koundoul-frontend.vercel.app
   ```
3. Si vous avez configuré un domaine personnalisé :
   ```env
   CORS_ORIGIN=https://workbiblow.com,https://www.workbiblow.com
   ```

**B. Redéployer le backend**
- Après modification de CORS_ORIGIN, Render doit redéployer
- Attendre la fin du redéploiement

**C. Vérifier l'URL exacte**
- L'URL dans CORS_ORIGIN doit correspondre exactement à l'URL Vercel
- Vérifier qu'il n'y a pas d'espace
- Vérifier le protocole (https://)

---

### Problème 4 : Connexion base de données échoue

#### Symptômes
- Erreur : `Database connection failed`
- Health check retourne `unhealthy`

#### Solutions

**A. Vérifier DATABASE_URL**
1. Render → Service → Environment
2. Vérifier que DATABASE_URL utilise le **Session Pooler** (port 5432) :
   ```
   postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
   ```

**B. Vérifier le mot de passe**
- Le mot de passe doit être : `atsatsATS1.ATS`
- Vérifier qu'il n'y a pas d'espaces avant/après

**C. Vérifier le Project Reference**
- Doit être : `wnbkplyerizogmufatxb`
- Vérifier dans l'URL de connexion

**D. Tester la connexion**
- Aller sur Supabase Dashboard → Settings → Database
- Tester la connection string depuis là

---

### Problème 5 : Frontend ne se connecte pas au backend

#### Symptômes
- Erreur : `Failed to fetch`
- Les appels API échouent
- Timeout

#### Solutions

**A. Vérifier VITE_API_URL**
1. Vercel → Project → Settings → Environment Variables
2. Vérifier que `VITE_API_URL` est correct :
   ```env
   VITE_API_URL=https://koundoul-backend.onrender.com
   ```
   ⚠️ **IMPORTANT** : Ne pas mettre `/api` à la fin, c'est ajouté automatiquement

**B. Vérifier que le backend est accessible**
```powershell
curl https://koundoul-backend.onrender.com/health
```

**C. Vérifier le service Render**
- Le service peut être "Sleeping" (plan gratuit)
- Attendre 30-60 secondes pour le réveil
- Ou passer au plan Starter pour éviter le sommeil

**D. Redéployer le frontend**
- Après modification de VITE_API_URL, redéployer
- Vercel → Deployments → Redeploy

---

## 📋 CHECKLIST DE DIAGNOSTIC

### Backend (Render)
- [ ] Service est "Live" (pas "Failed" ou "Sleeping")
- [ ] Variables d'environnement configurées
- [ ] DATABASE_URL utilise Session Pooler (port 5432)
- [ ] JWT_SECRET configuré
- [ ] CORS_ORIGIN configuré avec URL Vercel
- [ ] Health check fonctionne : `/health`
- [ ] Logs Render ne montrent pas d'erreurs

### Frontend (Vercel)
- [ ] Build réussi (statut "Ready")
- [ ] Variable VITE_API_URL configurée
- [ ] Site se charge sur l'URL Vercel
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Les appels API fonctionnent

### Base de données (Supabase)
- [ ] Connection string correcte
- [ ] Mot de passe correct
- [ ] Project Reference correct
- [ ] Base de données accessible depuis Supabase Dashboard

---

## 🔍 COMMANDES DE DIAGNOSTIC

### Tester le backend
```powershell
# Health check
curl https://koundoul-backend.onrender.com/health

# API docs
curl https://koundoul-backend.onrender.com/api/docs

# Root
curl https://koundoul-backend.onrender.com/
```

### Tester le frontend
```powershell
# Ouvrir dans le navigateur
start https://koundoul-frontend.vercel.app
```

### Vérifier les DNS (si domaine personnalisé)
```powershell
# Vérifier les DNS
nslookup workbiblow.com
```

---

## 📞 OÙ TROUVER LES LOGS

### Render (Backend)
1. Aller sur : https://dashboard.render.com
2. Sélectionner le service `koundoul-backend`
3. Cliquer sur "Logs"
4. Vérifier les erreurs récentes

### Vercel (Frontend)
1. Aller sur : https://vercel.com/dashboard
2. Sélectionner le projet `koundoul-frontend`
3. Cliquer sur le dernier déploiement
4. Vérifier les logs de build

### Console Navigateur
1. Ouvrir `https://koundoul-frontend.vercel.app`
2. Appuyer sur F12
3. Aller dans l'onglet "Console"
4. Vérifier les erreurs

---

## 💡 SOLUTION RAPIDE

Si vous ne savez pas par où commencer :

1. **Vérifier les logs Render** → Identifier les erreurs backend
2. **Vérifier les logs Vercel** → Identifier les erreurs frontend
3. **Vérifier la console navigateur** → Identifier les erreurs CORS/API
4. **Tester le health check** → Vérifier que le backend répond

---

## 📝 INFORMATIONS À FOURNIR

Pour m'aider à diagnostiquer, fournissez :

1. **Messages d'erreur exacts** (copier-coller)
2. **Où voyez-vous l'erreur ?** (Render logs, Vercel logs, console navigateur)
3. **Quelle étape échoue ?** (déploiement, connexion, build)
4. **Statut des services** :
   - Render : Live / Failed / Sleeping ?
   - Vercel : Ready / Failed / Building ?

---

**Dernière mise à jour** : 2025-12-06  
**Statut** : ⏳ En attente d'informations pour diagnostic






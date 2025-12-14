# 🔐 Identifiants Supabase et Vercel - Koundoul

**⚠️ FICHIER CONFIDENTIEL - NE PAS COMMITER SUR GITHUB**

**Date de création** : 2025-01-27  
**Projet** : Koundoul  
**Usage** : Pour utilisation dans d'autres projets

---

## 📊 SUPABASE

### Informations du projet
- **Project Reference** : `wnbkplyerizogmufatxb`
- **URL du projet** : `https://wnbkplyerizogmufatxb.supabase.co`
- **Dashboard** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb`
- **Région** : Europe (Nord) - `aws-1-eu-north-1`

### Credentials de connexion
- **Host (Direct)** : `db.wnbkplyerizogmufatxb.supabase.co`
- **Host (Pooler)** : `aws-1-eu-north-1.pooler.supabase.com`
- **Database** : `postgres`
- **User (Direct)** : `postgres`
- **User (Pooler)** : `postgres.wnbkplyerizogmufatxb`
- **Password** : `atsatsATS1.ATS`
- **Port (Direct)** : `5432`
- **Port (Session Pooler)** : `5432` ✅ RECOMMANDÉ
- **Port (Transaction Pooler)** : `6543`

### Connection Strings

#### 1. Connexion directe (port 5432)
```
postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres
```

#### 2. Session Pooler (port 5432) - ✅ RECOMMANDÉ pour production
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

#### 3. Transaction Pooler (port 6543)
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Clés API Supabase
⚠️ **À récupérer depuis le dashboard Supabase** :
1. Aller sur : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api`
2. Copier les clés suivantes :
   - **anon public key** : `[À RÉCUPÉRER]`
   - **service_role key** : `[À RÉCUPÉRER]` ⚠️ SECRET - Ne jamais exposer publiquement

### Variables d'environnement Supabase
```env
# URL Supabase
SUPABASE_URL=https://wnbkplyerizogmufatxb.supabase.co

# Clés API (à récupérer depuis le dashboard)
SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_SERVICE_KEY=[SERVICE-KEY]

# Connection String (recommandé: Session Pooler)
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

---

## 🌐 VERCEL

### Informations du service
- **Framework Preset** : Vite
- **Région** : Europe (Frankfurt) - Recommandé
- **URL de production** : `https://koundoul-frontend.vercel.app`
- **Dashboard** : `https://vercel.com/dashboard`

### Configuration Vercel
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`
- **Framework** : Vite

### Variables d'environnement Vercel
```env
# URL de l'API Backend
VITE_API_URL=https://koundoul-backend.onrender.com
```

### Token d'API Vercel
⚠️ **Les tokens Vercel ne sont pas stockés dans le projet** (bonne pratique de sécurité)

Pour obtenir un token Vercel :
1. Aller sur : `https://vercel.com/account/tokens`
2. Cliquer sur "Create Token"
3. Donner un nom au token (ex: "koundoul-deployment")
4. Sélectionner la portée (scope) : `Full Account` ou `Project` selon vos besoins
5. Copier le token généré (il ne sera affiché qu'une seule fois)

**Utilisation du token** :
```bash
# Via CLI
vercel login
vercel --token YOUR_TOKEN

# Ou configurer dans l'environnement
export VERCEL_TOKEN=your_token_here
```

---

## 🔗 LIENS UTILES

### Supabase
- **Dashboard** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb`
- **Database Settings** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/database`
- **API Settings** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api`
- **SQL Editor** : `https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/sql/new`

### Vercel
- **Dashboard** : `https://vercel.com/dashboard`
- **Account Tokens** : `https://vercel.com/account/tokens`
- **Project Settings** : `https://vercel.com/[USERNAME]/koundoul-frontend/settings`

---

## 📋 CHECKLIST POUR NOUVEAU PROJET

### Configuration Supabase
- [ ] Récupérer les clés API depuis le dashboard Supabase
- [ ] Ajouter `SUPABASE_URL` dans les variables d'environnement
- [ ] Ajouter `SUPABASE_ANON_KEY` dans les variables d'environnement
- [ ] Ajouter `SUPABASE_SERVICE_KEY` dans les variables d'environnement (backend uniquement)
- [ ] Configurer `DATABASE_URL` avec la connection string appropriée
- [ ] Tester la connexion à la base de données

### Configuration Vercel
- [ ] Créer un token d'API Vercel si nécessaire
- [ ] Configurer le projet dans Vercel
- [ ] Ajouter les variables d'environnement dans Vercel
- [ ] Configurer `VITE_API_URL` ou équivalent selon le projet
- [ ] Tester le déploiement

---

## ⚠️ SÉCURITÉ

1. **NE JAMAIS COMMITER** ce fichier sur GitHub ou tout autre dépôt public
2. **NE JAMAIS PARTAGER** les credentials publiquement
3. **UTILISER** des variables d'environnement pour stocker les secrets
4. **ROTATION RÉGULIÈRE** des secrets en production
5. **UTILISER** des secrets différents entre dev et prod
6. **ACTIVER** 2FA sur tous les comptes (Supabase, Vercel)
7. **NE JAMAIS EXPOSER** la `service_role key` dans le frontend
8. **UTILISER** le Session Pooler pour les connexions en production

---

## 📝 NOTES

- Les clés API Supabase doivent être récupérées depuis le dashboard
- Le token Vercel doit être créé depuis le compte Vercel
- Les URLs de production peuvent varier selon le projet
- Conserver une copie sécurisée de ce fichier (hors du repo Git)
- Mettre à jour ce fichier si les credentials changent

---

**Dernière mise à jour** : 2025-01-27  
**Statut** : ✅ Prêt pour utilisation dans d'autres projets




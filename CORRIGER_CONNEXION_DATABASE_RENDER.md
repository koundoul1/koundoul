# 🔧 Corriger Connexion Database - Render

## 🐛 Problème Actuel

**Erreur dans les logs Render** :
```
❌ Database connection failed: PrismaClientInitializationError: 
Can't reach database server at `aws-1-eu-north-1.pooler.supabase.com`:`6543`
```

Le backend ne peut pas se connecter à Supabase depuis Render.

---

## ✅ Solution : Configurer DATABASE_URL dans Render

### ÉTAPE 1 : Aller dans Render Dashboard

1. **Ouvrir** : https://dashboard.render.com
2. **Sélectionner** le service `koundoul-backend`
3. **Cliquer sur** **Environment** dans le menu de gauche
4. **Vérifier/Ajouter** la variable `DATABASE_URL`

### ÉTAPE 2 : Configurer DATABASE_URL

**Dans Render Dashboard → Environment → Environment Variables**, ajouter/modifier :

**Key** : `DATABASE_URL`  
**Value** (copier exactement, avec le port 6543 pour Transaction Pooler) :
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**⚠️ Important** :
- ✅ Port `6543` = Transaction Pooler (recommandé pour Prisma)
- ✅ `pgbouncer=true` = Active le mode pooler
- ✅ `connection_limit=1` = Limite les connexions par requête Prisma
- ✅ Format : `postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/DATABASE?params`

### ÉTAPE 3 : (Optionnel) Ajouter DIRECT_URL pour migrations

Si vous utilisez `prisma migrate`, ajouter aussi :

**Key** : `DIRECT_URL`  
**Value** :
```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Note** : `DIRECT_URL` utilise le port 5432 (Session Pooler) pour les migrations Prisma.

### ÉTAPE 4 : Sauvegarder et Redéployer

1. **Cliquer sur** **Save Changes**
2. **Aller dans** **Manual Deploy** (menu de gauche)
3. **Sélectionner** **Clear build cache & deploy**
4. **Cliquer sur** **Deploy latest commit**
5. **Attendre** 2-5 minutes pour le déploiement

---

## 📝 Configuration Complète des Variables d'Environnement

**Variables requises dans Render** :

```env
# Base de données Supabase (Transaction Pooler - Recommandé pour Prisma)
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Base de données pour migrations (Session Pooler - Optionnel)
DIRECT_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=votre_secret_jwt_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://koundoul-frontend.vercel.app

# Environnement
NODE_ENV=production
PORT=10000

# Google AI (Gemini)
GOOGLE_AI_API_KEY=votre_cle_gemini
GEMINI_API_KEY=votre_cle_gemini
```

---

## 🔍 Vérification

### Après redéploiement, vérifier les logs Render

**Succès attendu** :
```
✅ Database connected successfully
🚀 Serveur Koundoul démarré !
📍 Port: 10000
```

**Si erreur persiste** :
- Vérifier que `DATABASE_URL` est exactement comme indiqué ci-dessus
- Vérifier que le password est correct : `atsatsATS1.ATS`
- Vérifier que le host est correct : `aws-1-eu-north-1.pooler.supabase.com`
- Vérifier que le port est `6543` (Transaction Pooler)
- Vérifier que les paramètres `pgbouncer=true&connection_limit=1` sont présents

---

## 📊 Différence entre les Ports Supabase

| Port | Type | Usage |
|------|------|-------|
| **5432** | Session Pooler | Connexions longues, migrations Prisma |
| **6543** | Transaction Pooler | Connexions courtes, requêtes Prisma ✅ **RECOMMANDÉ** |

**Prisma fonctionne mieux avec le port 6543** car il ouvre/ferme les connexions rapidement.

---

## 🚨 Alternatives si le port 6543 ne fonctionne pas

### Option 1 : Session Pooler (port 5432)

Si le port 6543 ne fonctionne toujours pas, essayer le port 5432 :

```
postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**Note** : Retirer `pgbouncer=true&connection_limit=1` pour le port 5432.

### Option 2 : Connexion Directe (si pooler ne fonctionne pas)

```
postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres
```

**⚠️ Attention** : La connexion directe peut avoir des limites de connexions simultanées.

---

## ✅ Checklist de Vérification

Dans Render Dashboard → Environment Variables, vérifier :

- [ ] `DATABASE_URL` existe
- [ ] Format : `postgresql://postgres.wnbkplyerizogmufatxb:...`
- [ ] Host : `aws-1-eu-north-1.pooler.supabase.com`
- [ ] Port : `6543` (ou `5432` si 6543 ne fonctionne pas)
- [ ] Password : `atsatsATS1.ATS`
- [ ] Paramètres : `?pgbouncer=true&connection_limit=1` (pour port 6543)
- [ ] `JWT_SECRET` est configuré
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `CORS_ORIGIN` est configuré

---

**✅ Après configuration correcte de `DATABASE_URL`, le backend devrait se connecter à Supabase !**

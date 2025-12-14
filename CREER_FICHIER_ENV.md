# 🔧 CRÉER LE FICHIER .env BACKEND

## ❌ PROBLÈME ACTUEL

Le backend ne peut pas se connecter car :
- Le fichier `.env` n'existe pas dans `backend/`
- Il essaie de se connecter au port `5432` au lieu de `6543` (pooler)

---

## ✅ SOLUTION

### Étape 1 : Créer le fichier `.env`

Dans le dossier `backend/`, crée un fichier nommé **`.env`** (avec le point au début)

### Étape 2 : Copier cette configuration

```env
# Configuration Backend Koundoul

# Database (Supabase Pooler - PORT 6543)
DATABASE_URL="postgresql://postgres.wnbkplyerizogmufatxb:[VOTRE_MOT_DE_PASSE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Secret
JWT_SECRET="koundoul_secret_key_2024_super_secure_change_this"

# Port du serveur
PORT=5000

# Environment
NODE_ENV=development

# Gemini API (optionnel)
# GEMINI_API_KEY=votre_clé_ici

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Étape 3 : Remplacer `[VOTRE_MOT_DE_PASSE]`

**Où trouver le mot de passe ?**

1. Va sur https://supabase.com/dashboard/project/wnbkplyerizogmufatxb
2. Clique sur **Settings** (icône engrenage)
3. Clique sur **Database**
4. Cherche **"Connection string"** ou **"Connection pooling"**
5. Clique sur **"URI"** ou **"Connection string"**
6. Copie le mot de passe (entre `:` et `@`)

**Exemple :**
```
postgresql://postgres.xxx:MOT_DE_PASSE_ICI@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Étape 4 : Sauvegarder

Sauvegarde le fichier `.env` dans `backend/`

---

## 🎯 POINTS IMPORTANTS

### ⚠️ PORT 6543 (pas 5432)
Le pooler Supabase utilise le **port 6543**, pas 5432 !

### ⚠️ Nom du fichier
Le fichier doit s'appeler exactement **`.env`** (avec le point au début)

### ⚠️ Emplacement
Le fichier doit être dans le dossier **`backend/`**, pas à la racine

---

## 🧪 TESTER

Une fois le fichier `.env` créé :

```bash
cd backend
node server.js
```

Tu devrais voir :
```
✅ Database connected successfully
🚀 Server running on port 5000
```

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Option 1 : Utiliser la connexion directe

Remplace `DATABASE_URL` par :
```env
DATABASE_URL="postgresql://postgres.wnbkplyerizogmufatxb:[MOT_DE_PASSE]@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres"
```

### Option 2 : Vérifier le mot de passe

Dans Supabase Dashboard :
- Settings > Database
- Regarde "Connection string"
- Copie exactement le mot de passe

---

## 📝 RÉSUMÉ RAPIDE

```
1. Créer backend/.env
2. Copier la configuration ci-dessus
3. Remplacer [VOTRE_MOT_DE_PASSE]
4. Sauvegarder
5. Relancer: node server.js
```

**Temps estimé : 2 minutes** ⏱️










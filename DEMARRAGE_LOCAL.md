# 🚀 GUIDE DE DÉMARRAGE LOCAL - KOUNDOUL

## 📋 Prérequis

- Node.js 16+ et npm installés
- PostgreSQL installé (ou utiliser Supabase)
- Git installé

---

## 🛠️ Installation

### 1️⃣ Installer les dépendances

```bash
# Depuis la racine du projet
cd backend
npm install

cd ../frontend
npm install
```

### 2️⃣ Configuration de la base de données

#### Option A : Avec PostgreSQL local
```bash
# Créer une base de données
createdb koundoul_db

# Configurer le .env
cd backend
cp env.example .env
# Éditer .env et mettre à jour DATABASE_URL
```

#### Option B : Avec Supabase (Recommandé)
```bash
# Créer un compte gratuit sur https://supabase.com
# Créer un nouveau projet
# Copier l'URI de connexion
# Créer .env
cd backend
cp env.example .env
# Coller l'URI dans DATABASE_URL
```

### 3️⃣ Mettre en place la base de données

```bash
cd backend

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:push

# (Optionnel) Seed avec des données de test
npm run db:seed
```

---

## 🚀 Démarrage

### Option 1 : Script automatique (Recommandé)

```bash
# Depuis la racine du projet
.\start-all.ps1
```

### Option 2 : Démarrage manuel

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## 🌐 URLs

Une fois démarré :

- **Backend API** : http://localhost:3001
- **Frontend App** : http://localhost:5173
- **API Health** : http://localhost:3001/api/health

---

## 🔐 Compte de test

Email : `sambafaye184@yahoo.fr`  
Password : `atsatsATS1.ATS`

---

## ✅ Vérification

### Backend
```bash
curl http://localhost:3001/api/health
```

### Frontend
Ouvrir http://localhost:5173 dans le navigateur

---

## 🐛 Dépannage

### Erreur de base de données
```bash
cd backend
npm run db:push
```

### Port déjà utilisé
```bash
# Modifier PORT dans backend/.env
PORT=3002
```

### Erreur de modules
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **Backend API** : `backend/README.md`
- **Frontend** : `frontend/README.md`
- **Setup complet** : `backend/SETUP_GUIDE.md`

---

**Bon développement ! 🚀**



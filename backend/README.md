# 🚀 Koundoul Backend API

Backend API pour la plateforme Koundoul - Résolution de problèmes scientifiques avec IA.

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL (via Supabase)
- npm ou yarn

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate
```

## ⚙️ Configuration

1. Copier le fichier `.env.example` vers `.env`
2. Remplir les variables d'environnement :

```env
DATABASE_URL=postgresql://postgres:password@host:port/database
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
GOOGLE_AI_API_KEY=your-gemini-api-key
```

## 🗄️ Base de données

```bash
# Synchroniser le schéma Prisma avec la base de données
npm run db:push

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000` (ou le port configuré dans `.env`)

## 📚 API Endpoints

- **Health Check** : `GET /health`
- **Documentation** : `GET /api/docs`
- **Authentification** : `/api/auth`
- **Résolveur** : `/api/solver`
- **Quiz** : `/api/quiz`
- **Contenu** : `/api/content`
- **Dashboard** : `/api/dashboard`

## 🌐 Déploiement sur Render

1. Connecter le repository GitHub
2. Configurer les variables d'environnement dans Render
3. Build Command : `npm install`
4. Start Command : `node server.js`
5. Utiliser le **Session Pooler** Supabase (port 5432) pour IPv4

### Variables d'environnement Render

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-REGION.pooler.supabase.com:5432/postgres
JWT_SECRET=your-secure-secret-key
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🧪 Tests

```bash
npm test
```

## 📝 Structure du projet

```
backend/
├── src/
│   ├── app.js              # Application Express
│   ├── config/             # Configuration
│   ├── database/           # Prisma + Supabase
│   ├── modules/            # Modules métier
│   ├── middlewares/        # Middlewares Express
│   └── utils/              # Utilitaires
├── prisma/
│   └── schema.prisma       # Schéma de base de données
└── server.js               # Point d'entrée
```

## 🔒 Sécurité

- Helmet pour les headers de sécurité
- CORS configuré
- Rate limiting
- JWT pour l'authentification
- Validation des entrées avec express-validator

## 📄 Licence

MIT

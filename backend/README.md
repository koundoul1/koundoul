# Koundoul Backend API

Backend API pour la plateforme éducative Koundoul.

## 🚀 Déploiement sur Render

### Configuration requise

1. **Variables d'environnement** à configurer dans Render Dashboard :
   - `DATABASE_URL` : URL de connexion PostgreSQL
   - `PORT` : Port du serveur (généralement 5000, défini automatiquement par Render)
   - `NODE_ENV` : `production`
   - `FRONTEND_URL` : URL du frontend Vercel (ex: https://koundoul.vercel.app)
   - `JWT_SECRET` : Clé secrète pour JWT (générer une chaîne aléatoire)

### Build Command
```
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
```

**Note importante** : La première fois, vous devrez peut-être exécuter manuellement la migration dans Render :
1. Aller dans le service backend sur Render
2. Ouvrir le shell
3. Exécuter : `npx prisma migrate deploy`

### Start Command
```
cd backend && npm start
```

### Root Directory
```
backend
```

## 📁 Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, etc.)
│   ├── middlewares/     # Middlewares Express
│   ├── modules/         # Modules métier (auth, badges, etc.)
│   ├── routes/          # Routes API
│   └── index.js         # Point d'entrée principal
├── prisma/
│   └── schema.prisma    # Schéma Prisma
└── package.json
```

## 🔌 Endpoints

- `GET /health` - Health check
- `GET /api` - Informations API
- `POST /api/auth/login` - Connexion (à implémenter)
- `POST /api/auth/register` - Inscription (à implémenter)
- `GET /api/users` - Liste des utilisateurs

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Générer Prisma Client
npx prisma generate

# Démarrer en mode développement
npm run dev
```

## 📝 Notes

- Le backend utilise Express.js
- Base de données : PostgreSQL via Prisma ORM
- Authentification : JWT (à implémenter complètement)
- CORS configuré pour le frontend Vercel


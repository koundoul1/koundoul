# 🌐 Koundoul Frontend

Interface utilisateur React pour la plateforme Koundoul.

## 📋 Prérequis

- Node.js 18+
- npm ou yarn

## 🔧 Installation

```bash
# Installer les dépendances
npm install
```

## ⚙️ Configuration

1. Copier le fichier `.env.example` vers `.env`
2. Configurer l'URL de l'API backend :

```env
# En développement local
VITE_API_URL=http://localhost:5000

# En production (après déploiement backend)
VITE_API_URL=https://koundoul-backend.onrender.com
```

**Note** : Vite nécessite le préfixe `VITE_` pour exposer les variables au client.

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

L'application démarre sur `http://localhost:3002` (configuré dans `vite.config.js`)

### Build Production
```bash
npm run build
```

Le build génère les fichiers dans le dossier `dist/`

### Preview Production
```bash
npm run preview
```

## 🌐 Déploiement sur Vercel

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement :
   - `VITE_API_URL` = URL du backend Render
3. Build Command : `npm run build`
4. Output Directory : `dist`
5. Install Command : `npm install`

### Variables d'environnement Vercel

```env
VITE_API_URL=https://koundoul-backend.onrender.com
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── pages/              # Pages React
│   ├── components/         # Composants réutilisables
│   ├── services/           # Services API
│   ├── context/            # Context React
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilitaires
├── public/                 # Fichiers statiques
└── vite.config.js          # Configuration Vite
```

## 🛠️ Technologies

- **React** 18.2.0
- **Vite** 4.3.2
- **React Router** 6.8.1
- **Tailwind CSS** 3.2.7
- **KaTeX** pour le rendu mathématique
- **Plotly.js** pour les graphiques
- **Lucide React** pour les icônes

## 🧪 Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Preview du build de production
- `npm run lint` - Linter le code
- `npm test` - Exécute les tests

## 🔗 Liens utiles

- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)

## 📄 Licence

MIT






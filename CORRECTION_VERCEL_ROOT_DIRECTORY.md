# 🔧 Correction Root Directory Vercel

## Problème
Vercel cherche un dossier "frontend" qui n'existe pas. Le projet est à la racine du repository.

## Solution

### Option 1 : Modifier dans le Dashboard Vercel (RECOMMANDÉ)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `koundoul-frontend` ou `koundoul`
3. Cliquez sur **Settings**
4. Dans la section **General**, trouvez **Root Directory**
5. **Supprimez** la valeur "frontend" ou laissez-la **vide**
6. Cliquez sur **Save**
7. Redéployez le projet (ou faites un nouveau commit)

### Option 2 : Utiliser vercel.json (Déjà fait)

Le fichier `vercel.json` a été mis à jour avec `"rootDirectory": "."` pour forcer la racine.

**Important** : Si le Root Directory est défini dans le dashboard Vercel, il prend priorité sur `vercel.json`. Vous devez donc le supprimer dans le dashboard.

## Vérification

Après correction, le build devrait :
- ✅ Trouver `package.json` à la racine
- ✅ Trouver `src/` à la racine
- ✅ Trouver `index.html` à la racine
- ✅ Builder correctement avec `npm run build`

## Structure du Projet

```
koundoul/
├── src/              ← Code frontend ici
├── package.json      ← Package.json à la racine
├── index.html        ← Index.html à la racine
├── vite.config.js
├── vercel.json       ← Configuration Vercel
└── backend/         ← Backend (ignoré par Vercel)
```

Le frontend est **à la racine**, pas dans un dossier `frontend/`.



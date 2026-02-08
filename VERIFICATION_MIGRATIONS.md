# 🔍 Vérification des Migrations Prisma

## Comment vérifier si les migrations ont été exécutées

### ✅ Méthode 1 : Via Render Dashboard (Recommandé)

1. **Aller sur Render Dashboard** : https://dashboard.render.com
2. **Ouvrir le service backend** : `koundoul-backend`
3. **Ouvrir le Shell** (bouton "Shell" dans le menu)
4. **Exécuter** :
   ```bash
   cd backend
   npx prisma migrate status
   ```

**Résultat attendu** :
- ✅ `Database schema is up to date!` = Migrations exécutées
- ⚠️ `X migration(s) have not yet been applied` = Migrations non exécutées

### ✅ Méthode 2 : Vérifier les logs de build Render

1. **Aller sur Render Dashboard** → Service backend
2. **Ouvrir "Events"** ou "Logs"
3. **Chercher dans les logs de build** :
   ```
   ✔ Generated Prisma Client
   ✔ Applied migration: 20240207000000_init
   ```

Si vous voyez `Applied migration`, les migrations ont été exécutées.

### ✅ Méthode 3 : Vérifier directement dans la base de données

1. **Ouvrir le Shell Render**
2. **Exécuter le script de vérification** :
   ```bash
   cd backend
   npm run check-migrations
   ```

Ce script vérifie :
- ✅ Si la table `_prisma_migrations` existe
- ✅ Quelles migrations ont été appliquées
- ✅ Quelles tables ont été créées

### ⚠️ Si les migrations n'ont PAS été exécutées

**Exécuter manuellement** :

1. **Ouvrir le Shell Render**
2. **Exécuter** :
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

**Résultat attendu** :
```
✔ Applied migration: 20240207000000_init
```

### 📋 Checklist

- [ ] Vérifier le Build Command dans Render inclut `npx prisma migrate deploy`
- [ ] Vérifier les logs de build pour voir si la migration a été appliquée
- [ ] Si non, exécuter manuellement `npx prisma migrate deploy` dans le Shell Render
- [ ] Vérifier que les tables existent avec `npm run check-migrations`

### 🔧 Configuration Render Actuelle

**Build Command** (dans `render.yaml`) :
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Important** : Si le Build Command dans Render Dashboard est différent, il faut le mettre à jour pour inclure `npx prisma migrate deploy`.


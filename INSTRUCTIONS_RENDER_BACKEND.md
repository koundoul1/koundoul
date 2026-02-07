# Instructions pour corriger le déploiement Render Backend

## Problème
Le service backend Render essaie de builder un dossier `backend/` qui n'existe pas dans le repo Git, causant l'erreur :
```
bash: line 1: cd: backend: No such file or directory
```

## Solution : Suspendre le service backend dans Render Dashboard

### Étapes à suivre :

1. **Aller sur Render Dashboard** : https://dashboard.render.com

2. **Trouver le service "koundoul-backend"**

3. **Suspendre le service** :
   - Cliquer sur le service "koundoul-backend"
   - Cliquer sur le bouton "Suspend" ou "Pause" en haut à droite
   - Confirmer la suspension

### Alternative : Supprimer le service

Si vous ne prévoyez pas de déployer le backend maintenant :

1. **Aller sur Render Dashboard**
2. **Trouver le service "koundoul-backend"**
3. **Cliquer sur "Settings"**
4. **Faire défiler jusqu'à "Delete Service"**
5. **Confirmer la suppression**

## Pour réactiver le backend plus tard

Quand le backend sera prêt :

1. **Ajouter le backend au repo Git** :
   ```bash
   git add backend/
   git commit -m "feat: Ajouter backend au repo"
   git push origin main
   ```

2. **Créer un nouveau service dans Render** :
   - Type: Web Service
   - Name: koundoul-backend
   - Environment: Node
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

3. **Configurer les variables d'environnement** :
   - `NODE_ENV=production`
   - `DATABASE_URL` (votre URL de base de données)
   - `JWT_SECRET` (votre secret JWT)
   - `PORT=5000`

## Note importante

Le fichier `render.yaml` a été mis à jour pour désactiver le service backend, mais Render Dashboard peut avoir une configuration qui surcharge ce fichier. C'est pourquoi il faut suspendre ou supprimer le service directement dans le dashboard.


# 🚀 Guide de Déploiement Backend - Koundoul

## ✅ Modifications Effectuées

### 1. Migration Prisma
- **Fichier créé** : `backend/prisma/migrations/20250215000000_add_invitation_codes/migration.sql`
- **Champs ajoutés** :
  - `invitationCode` (TEXT, UNIQUE) - Code d'invitation pour les parents
  - `parentInvitationCode` (TEXT) - Code du parent (si utilisateur est un enfant)

### 2. Route Parent Dashboard
- **Fichier créé** : `backend/src/routes/parent.js`
- **Endpoints disponibles** :
  - `GET /api/parent/children` - Liste des enfants
  - `GET /api/parent/dashboard/:childId` - Dashboard d'un enfant
  - `GET /api/parent/notifications/:childId` - Notifications
  - `PUT /api/parent/notifications/:childId` - Mise à jour notifications

### 3. Initialisation Automatique des Plans
- **Fonction ajoutée** : `initSubscriptionPlans()` dans `backend/src/index.js`
- **Plans créés automatiquement** :
  - Gratuit (0 XOF)
  - Premium (5000 XOF/mois)
  - Famille (10000 XOF/mois)
  - Premium Annuel (50000 XOF/an)

## 🔄 Processus de Déploiement sur Render

### Configuration Render (render.yaml)
Le fichier `render.yaml` est déjà configuré avec :
```yaml
buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
startCommand: npm start
```

### Déploiement Automatique
1. **Render détecte automatiquement** le nouveau commit sur `main`
2. **Build automatique** :
   - `npm install` - Installation des dépendances
   - `npx prisma generate` - Génération du client Prisma
   - `npx prisma migrate deploy` - **Exécution automatique des migrations**
3. **Démarrage** : `npm start` (lance `node src/index.js`)

### Vérification du Déploiement

#### 1. Vérifier les Logs Render
Dans le dashboard Render, vérifiez que vous voyez :
```
✅ Migrations Prisma vérifiées
✅ Plans d'abonnement initialisés
🚀 Koundoul Backend API running on port 5000
```

#### 2. Tester les Endpoints

**Health Check** :
```bash
curl https://votre-backend-url.onrender.com/health
```

**Migration Status** :
```bash
curl https://votre-backend-url.onrender.com/api/migrations/status
```

**Plans d'Abonnement** :
```bash
curl https://votre-backend-url.onrender.com/api/subscriptions/plans
```

**Parent Dashboard** (avec token) :
```bash
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  https://votre-backend-url.onrender.com/api/parent/children
```

## 📋 Checklist Post-Déploiement

- [ ] Vérifier que le build Render a réussi
- [ ] Vérifier que les migrations ont été exécutées (logs Render)
- [ ] Tester `/health` endpoint
- [ ] Tester `/api/subscriptions/plans` (doit retourner 4 plans)
- [ ] Tester `/api/parent/children` (avec authentification)
- [ ] Vérifier que les pages frontend fonctionnent :
  - [ ] `/profile` - Profil utilisateur
  - [ ] `/subscriptions` - Plans d'abonnement
  - [ ] `/parent-dashboard` - Dashboard parents

## 🐛 En Cas de Problème

### Si les migrations échouent
1. Vérifier les logs Render pour l'erreur exacte
2. Vérifier que `DATABASE_URL` est bien configuré dans Render
3. Exécuter manuellement dans le shell Render :
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Si les plans ne sont pas créés
1. Vérifier les logs au démarrage du serveur
2. Vérifier que la table `SubscriptionPlan` existe
3. Exécuter manuellement le script :
   ```bash
   cd backend
   node src/scripts/initPlans.js
   ```

## 📝 Notes Importantes

- Les migrations sont **automatiquement exécutées** lors du build grâce à `npx prisma migrate deploy` dans `buildCommand`
- Les plans sont **automatiquement initialisés** au démarrage du serveur si les migrations sont OK
- Le backend doit être redémarré après chaque déploiement pour que les changements prennent effet

## 🔗 Liens Utiles

- Dashboard Render : https://dashboard.render.com
- Documentation Prisma Migrate : https://www.prisma.io/docs/concepts/components/prisma-migrate
- Logs Render : Accessibles depuis le dashboard Render


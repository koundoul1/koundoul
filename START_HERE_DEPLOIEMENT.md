# 🚀 DÉMARRAGE RAPIDE - DÉPLOIEMENT KOUNDOUL

**Nom d'utilisateur GitHub** : `koundoul1`  
**Tout est prêt ! Suivez ces étapes dans l'ordre.**

---

## ⚡ DÉMARRAGE ULTRA-RAPIDE (5 minutes)

### 1️⃣ Créer les repositories GitHub

**Ouvrir ces liens dans votre navigateur** :

- **Backend** : https://github.com/new
  - Nom : `koundoul-backend`
  - **NE PAS** cocher "Add a README file"
  - Cliquer "Create repository"

- **Frontend** : https://github.com/new
  - Nom : `koundoul-frontend`
  - **NE PAS** cocher "Add a README file"
  - Cliquer "Create repository"

### 2️⃣ Préparer et pousser le code

**Exécuter ce script PowerShell** :
```powershell
.\PREPARER-REPOS-GITHUB.ps1
```

Le script va automatiquement préparer les deux repositories. Ensuite, exécutez les commandes affichées pour pousser sur GitHub.

### 3️⃣ Générer JWT_SECRET

```powershell
.\GENERER-JWT-SECRET.ps1
```

**Copier le secret généré** pour l'étape suivante.

### 4️⃣ Déployer sur Render (Backend)

1. Aller sur : https://dashboard.render.com
2. **New +** → **Web Service**
3. Sélectionner `koundoul-backend`
4. Configuration :
   - **Region** : Europe (Frankfurt)
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
5. Variables d'environnement (voir `COMMANDES_FINALES_KOUNDOUL1.md`)
6. **Create Web Service**
7. **Copier l'URL** générée

### 5️⃣ Déployer sur Vercel (Frontend)

1. Aller sur : https://vercel.com/dashboard
2. **Add New...** → **Project**
3. Sélectionner `koundoul-frontend`
4. Variable d'environnement :
   ```env
   VITE_API_URL=[URL_RENDER_COPIÉE_À_L_ÉTAPE_4]
   ```
5. **Deploy**
6. **Copier l'URL** générée

### 6️⃣ Mettre à jour CORS

1. Retourner sur Render
2. Mettre à jour `CORS_ORIGIN` avec l'URL Vercel
3. Sauvegarder (redéploiement automatique)

---

## 📚 GUIDES DÉTAILLÉS

- **`COMMANDES_FINALES_KOUNDOUL1.md`** - Guide complet avec toutes les commandes
- **`README_DEPLOIEMENT.md`** - Guide détaillé étape par étape
- **`IDENTIFIANTS_KOUNDOUL.md`** - Template pour les credentials

---

## 🛠️ SCRIPTS DISPONIBLES

- **`DEPLOIEMENT-AUTOMATIQUE.ps1`** - Menu interactif pour tout faire
- **`PREPARER-REPOS-GITHUB.ps1`** - Prépare les repos Git automatiquement
- **`GENERER-JWT-SECRET.ps1`** - Génère un JWT_SECRET sécurisé

---

## ✅ CHECKLIST RAPIDE

- [ ] Repos GitHub créés (`koundoul-backend` et `koundoul-frontend`)
- [ ] Code poussé sur GitHub
- [ ] JWT_SECRET généré
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] CORS mis à jour
- [ ] Tests réussis

---

## 🎯 RÉSULTAT FINAL

Après déploiement, vous aurez :

- ✅ **Backend** : `https://koundoul-backend.onrender.com`
- ✅ **Frontend** : `https://koundoul-frontend.vercel.app`
- ✅ **Database** : `wnbkplyerizogmufatxb.supabase.co`

---

**Temps estimé** : 15-30 minutes  
**Prêt à démarrer ?** Exécutez `.\PREPARER-REPOS-GITHUB.ps1` ! 🚀






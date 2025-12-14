# 🌐 CONFIGURATION DOMAINE PERSONNALISÉ - FRONTEND UNIQUEMENT

**Domaine** : `workbiblow.com`  
**Cible** : Frontend Vercel uniquement  
**Coût** : ✅ **GRATUIT**  
**Date** : 2025-12-06

---

## ✅ POURQUOI SEULEMENT LE FRONTEND ?

- ✅ **Backend** : API cachée, appelée uniquement par le frontend
- ✅ **Utilisateurs** : Ne voient jamais l'URL du backend
- ✅ **Économie** : Pas besoin de payer $7/mois pour Render Starter
- ✅ **Frontend** : C'est ce que les utilisateurs voient, donc c'est là qu'il faut le domaine personnalisé

---

## 🚀 CONFIGURATION SIMPLIFIÉE

### Configuration Finale
- **Frontend** : `workbiblow.com` → Vercel ✅ (Gratuit)
- **Backend** : `koundoul-backend.onrender.com` → Render Free ✅ (Gratuit, garder l'URL)

**Résultat** : Les utilisateurs accèdent à `workbiblow.com`, le backend reste caché.

---

## 📋 ÉTAPES DE CONFIGURATION

### Étape 1 : Ajouter le domaine sur Vercel

1. **Aller sur** : https://vercel.com/dashboard
2. **Sélectionner** le projet **`koundoul-frontend`**
3. **Aller dans** : **"Settings"** → **"Domains"**
4. **Cliquer sur** : **"Add Domain"**
5. **Entrer** : `workbiblow.com`
6. **Cliquer sur** : **"Add"**

### Étape 2 : Configurer les DNS

Vercel va afficher les enregistrements DNS à ajouter. Généralement :

#### Enregistrements à ajouter chez votre registrar DNS :

**Pour le domaine principal (`workbiblow.com`)** :
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600 (ou Auto)
```

**Pour www (`www.workbiblow.com`)** :
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (ou Auto)
```

⚠️ **Note** : Les valeurs exactes seront affichées par Vercel. Utilisez celles fournies par Vercel.

### Étape 3 : Ajouter les enregistrements DNS

1. **Aller sur** votre registrar DNS (où vous avez acheté le domaine)
   - Exemples : Namecheap, GoDaddy, Google Domains, Cloudflare, etc.
2. **Accéder à** la gestion DNS / Zone DNS
3. **Ajouter** les enregistrements affichés par Vercel
4. **Sauvegarder** les modifications

### Étape 4 : Attendre la propagation DNS

- ⏱️ **Temps** : 5 minutes à 48 heures (généralement 5-30 minutes)
- 🔍 **Vérifier** : Vercel vérifiera automatiquement
- ✅ **Statut** : Le domaine passera à "Valid" une fois configuré

### Étape 5 : Vérifier la configuration

- Vercel affichera le statut du domaine
- Une fois "Valid", le domaine sera actif
- SSL/HTTPS sera automatiquement configuré par Vercel
- Testez : `https://workbiblow.com`

---

## ⚙️ MISE À JOUR DES VARIABLES D'ENVIRONNEMENT

### Aucun changement nécessaire !

Le frontend utilise déjà `VITE_API_URL` qui pointe vers le backend Render.  
Le backend reste sur `koundoul-backend.onrender.com` (pas de changement).

**Variables actuelles (à garder)** :

**Frontend (Vercel)** :
```env
VITE_API_URL=https://koundoul-backend.onrender.com
```

**Backend (Render)** :
```env
CORS_ORIGIN=https://workbiblow.com,https://www.workbiblow.com
FRONTEND_URL=https://workbiblow.com
```

⚠️ **IMPORTANT** : Mettre à jour `CORS_ORIGIN` dans Render avec le nouveau domaine frontend !

---

## 🔧 MISE À JOUR CORS DANS RENDER

### Après configuration du domaine frontend

1. **Aller sur** : https://dashboard.render.com
2. **Sélectionner** le service **`koundoul-backend`**
3. **Aller dans** : **"Environment"**
4. **Mettre à jour** :
   ```env
   CORS_ORIGIN=https://workbiblow.com,https://www.workbiblow.com
   FRONTEND_URL=https://workbiblow.com
   ```
5. **Cliquer sur** : **"Save Changes"**
6. Render redéploiera automatiquement

---

## ✅ CHECKLIST DE CONFIGURATION

### Frontend (Vercel)
- [ ] Domaine `workbiblow.com` ajouté sur Vercel
- [ ] Enregistrements DNS configurés chez le registrar
- [ ] Propagation DNS terminée (domaine "Valid" sur Vercel)
- [ ] Site accessible sur `https://workbiblow.com`
- [ ] SSL/HTTPS activé automatiquement

### Backend (Render)
- [ ] Variable `CORS_ORIGIN` mise à jour avec `https://workbiblow.com`
- [ ] Variable `FRONTEND_URL` mise à jour avec `https://workbiblow.com`
- [ ] Backend redéployé après modification
- [ ] Tests de connexion frontend → backend réussis

### Tests
- [ ] Ouvrir `https://workbiblow.com` dans le navigateur
- [ ] Vérifier que la page se charge
- [ ] Ouvrir la console (F12) et vérifier qu'il n'y a pas d'erreurs CORS
- [ ] Tester une fonctionnalité qui appelle l'API backend
- [ ] Vérifier que les appels API fonctionnent

---

## 🐛 TROUBLESHOOTING

### Le domaine n'est pas accessible

**Vérifications** :
1. ✅ Les enregistrements DNS sont-ils corrects ?
2. ✅ Avez-vous attendu la propagation DNS (5-30 min) ?
3. ✅ Le domaine est-il "Valid" sur Vercel ?
4. ✅ Le domaine n'est-il pas utilisé ailleurs ?

**Vérifier les DNS** :
- Utiliser : https://dnschecker.org
- Entrer : `workbiblow.com`
- Vérifier que les enregistrements pointent vers Vercel

### Erreur CORS après configuration

**Problème** : Erreurs CORS dans la console du navigateur

**Solution** :
1. Vérifier que `CORS_ORIGIN` dans Render contient `https://workbiblow.com`
2. Vérifier que toutes les variantes sont incluses :
   - `https://workbiblow.com`
   - `https://www.workbiblow.com`
3. Redéployer le backend après modification

### Le site ne se charge pas

**Vérifications** :
1. Vérifier que le domaine est "Valid" sur Vercel
2. Vérifier que les DNS sont correctement configurés
3. Attendre la propagation DNS complète
4. Vérifier dans Vercel les logs de déploiement

---

## 📝 MISE À JOUR DE LA DOCUMENTATION

Après configuration réussie, mettre à jour :

1. **`TRACABILITE_DEPLOIEMENT.md`**
   - Section "URLs DE PRODUCTION" → Frontend : `https://workbiblow.com`

2. **`DEPLOIEMENT_COMPLET.md`**
   - Section "URLs DE PRODUCTION" → Frontend : `https://workbiblow.com`

3. **`IDENTIFIANTS_KOUNDOUL.md`**
   - Section "VERCEL" → URL : `https://workbiblow.com`

---

## 💡 RÉSUMÉ RAPIDE

### Ce qu'il faut faire :

1. **Vercel** → Settings → Domains → Add `workbiblow.com`
2. **DNS** → Ajouter les enregistrements fournis par Vercel
3. **Attendre** → Propagation DNS (5-30 minutes)
4. **Render** → Mettre à jour `CORS_ORIGIN` avec `https://workbiblow.com`
5. **Tester** → Ouvrir `https://workbiblow.com`

### Ce qui ne change pas :

- ✅ Backend reste sur `koundoul-backend.onrender.com`
- ✅ Variable `VITE_API_URL` reste la même
- ✅ Pas besoin de payer pour Render Starter
- ✅ Tout reste gratuit !

---

## 🎯 RÉSULTAT FINAL

**URLs de production** :
- **Frontend** : `https://workbiblow.com` ✅ (Domaine personnalisé)
- **Backend** : `https://koundoul-backend.onrender.com` ✅ (URL Render, cachée)

**Expérience utilisateur** :
- Les utilisateurs accèdent à `workbiblow.com`
- Le backend est appelé automatiquement en arrière-plan
- L'URL du backend n'est jamais visible par les utilisateurs

---

**Dernière mise à jour** : 2025-12-06  
**Coût** : ✅ **GRATUIT**  
**Statut** : ⏳ En attente de configuration






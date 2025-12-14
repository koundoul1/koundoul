# 🌐 CONFIGURATION DOMAINE PERSONNALISÉ - KOUNDOUL

**Domaine** : `workbiblow.com`  
**Date** : 2025-12-06  
**Statut** : ⏳ À configurer

⚠️ **NOTE** : Pour une configuration simplifiée (frontend uniquement), consultez **`CONFIGURER_DOMAINE_FRONTEND.md`**

---

## 📋 OPTIONS DE CONFIGURATION

### Option 1 : Domaine Principal pour Frontend (Recommandé)
- **Frontend** : `workbiblow.com` → Vercel
- **Backend** : `api.workbiblow.com` → Render (sous-domaine)
- **Avantages** : URL principale propre, API séparée

### Option 2 : Sous-domaines Séparés
- **Frontend** : `app.workbiblow.com` → Vercel
- **Backend** : `api.workbiblow.com` → Render
- **Avantages** : Flexibilité, organisation claire

### Option 3 : Domaine Principal + Backend sur Render
- **Frontend** : `workbiblow.com` → Vercel
- **Backend** : `koundoul-backend.onrender.com` (garder l'URL Render)
- **Avantages** : Plus simple, moins de configuration DNS

---

## 🚀 CONFIGURATION RECOMMANDÉE (Option 1)

### Frontend : `workbiblow.com` → Vercel

#### Étape 1 : Ajouter le domaine sur Vercel

1. Aller sur : https://vercel.com/dashboard
2. Sélectionner le projet **`koundoul-frontend`**
3. Aller dans **"Settings"** → **"Domains"**
4. Cliquer sur **"Add Domain"**
5. Entrer : `workbiblow.com`
6. Cliquer sur **"Add"**

#### Étape 2 : Configurer les DNS

Vercel va afficher les enregistrements DNS à ajouter. Généralement :

**Pour le domaine principal (`workbiblow.com`)** :
```
Type: A
Name: @
Value: 76.76.21.21
```

**Pour www (`www.workbiblow.com`)** :
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Étape 3 : Ajouter les enregistrements DNS

1. Aller sur votre registrar DNS (où vous avez acheté le domaine)
2. Accéder à la gestion DNS
3. Ajouter les enregistrements affichés par Vercel
4. Attendre la propagation DNS (5 minutes à 48 heures)

#### Étape 4 : Vérifier la configuration

- Vercel vérifiera automatiquement la configuration
- Une fois validé, le domaine sera actif
- SSL/HTTPS sera automatiquement configuré par Vercel

---

### Backend : `api.workbiblow.com` → Render

#### Étape 1 : Vérifier si Render supporte les domaines personnalisés

⚠️ **IMPORTANT** : Render Free ne supporte **PAS** les domaines personnalisés.  
✅ **Solution** : Passer au plan **Starter** ($7/mois) ou utiliser l'URL Render.

#### Option A : Utiliser Render Starter (Recommandé)

1. Aller sur : https://dashboard.render.com
2. Sélectionner le service **`koundoul-backend`**
3. Aller dans **"Settings"** → **"Plan"**
4. Upgrader vers **Starter** ($7/mois)
5. Aller dans **"Settings"** → **"Custom Domain"**
6. Ajouter : `api.workbiblow.com`

#### Option B : Garder l'URL Render (Gratuit)

Si vous voulez rester sur le plan gratuit :
- Garder : `https://koundoul-backend.onrender.com`
- Mettre à jour seulement les variables d'environnement frontend

#### Étape 2 : Configurer les DNS pour le sous-domaine API

**Pour `api.workbiblow.com`** :
```
Type: CNAME
Name: api
Value: [VALUE_FOURNIE_PAR_RENDER]
```

Render fournira la valeur exacte après configuration du domaine personnalisé.

---

## ⚙️ MISE À JOUR DES VARIABLES D'ENVIRONNEMENT

### Frontend (Vercel)

Après configuration du domaine, mettre à jour :

```env
# Pas de changement nécessaire si vous utilisez VITE_API_URL
VITE_API_URL=https://api.workbiblow.com
# OU garder l'URL Render si vous ne configurez pas le domaine backend
VITE_API_URL=https://koundoul-backend.onrender.com
```

### Backend (Render)

Mettre à jour les variables d'environnement :

```env
# Mettre à jour CORS_ORIGIN avec le nouveau domaine
CORS_ORIGIN=https://workbiblow.com,https://www.workbiblow.com
FRONTEND_URL=https://workbiblow.com
```

---

## 🔧 CONFIGURATION DNS COMPLÈTE

### Enregistrements DNS à Ajouter

#### Chez votre Registrar DNS (ex: Namecheap, GoDaddy, etc.)

```
# Domaine principal (Frontend Vercel)
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

# www (Frontend Vercel)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600

# API (Backend Render) - Si vous configurez le domaine personnalisé
Type: CNAME
Name: api
Value: [VALUE_RENDER]  # Render fournira cette valeur
TTL: 3600
```

⚠️ **Note** : Les valeurs exactes seront fournies par Vercel et Render lors de la configuration.

---

## 📝 CHECKLIST DE CONFIGURATION

### Frontend (Vercel)
- [ ] Domaine ajouté sur Vercel (`workbiblow.com`)
- [ ] Enregistrements DNS configurés
- [ ] Propagation DNS vérifiée
- [ ] SSL/HTTPS activé automatiquement
- [ ] Site accessible sur `https://workbiblow.com`

### Backend (Render)
- [ ] Plan Starter activé (si domaine personnalisé souhaité)
- [ ] Domaine personnalisé ajouté (`api.workbiblow.com`)
- [ ] Enregistrement CNAME configuré
- [ ] Variables d'environnement mises à jour (CORS_ORIGIN)
- [ ] Backend accessible sur `https://api.workbiblow.com`

### Configuration Finale
- [ ] Variable `VITE_API_URL` mise à jour dans Vercel
- [ ] Variable `CORS_ORIGIN` mise à jour dans Render
- [ ] Tests de connexion frontend → backend réussis
- [ ] Documentation mise à jour

---

## 🔄 MISE À JOUR DE LA DOCUMENTATION

Après configuration, mettre à jour :

1. **`TRACABILITE_DEPLOIEMENT.md`**
   - Section "URLs DE PRODUCTION"
   - Section "Configuration des variables d'environnement"

2. **`DEPLOIEMENT_COMPLET.md`**
   - Section "URLs DE PRODUCTION"

3. **`IDENTIFIANTS_KOUNDOUL.md`**
   - Section "VERCEL" et "RENDER"

---

## 🐛 TROUBLESHOOTING

### Le domaine ne fonctionne pas sur Vercel

**Problème** : Le domaine n'est pas accessible

**Solutions** :
1. Vérifier que les enregistrements DNS sont corrects
2. Attendre la propagation DNS (peut prendre jusqu'à 48h)
3. Vérifier dans Vercel que le domaine est "Valid"
4. Vérifier que le domaine n'est pas utilisé ailleurs

### Le sous-domaine API ne fonctionne pas

**Problème** : `api.workbiblow.com` ne pointe pas vers Render

**Solutions** :
1. Vérifier que vous êtes sur le plan Starter (pas Free)
2. Vérifier que le CNAME est correctement configuré
3. Vérifier dans Render que le domaine est "Active"
4. Attendre la propagation DNS

### Erreur CORS après changement de domaine

**Problème** : Erreurs CORS après configuration du domaine

**Solutions** :
1. Mettre à jour `CORS_ORIGIN` dans Render avec le nouveau domaine
2. Redéployer le backend après modification
3. Vérifier que toutes les variantes du domaine sont incluses :
   - `https://workbiblow.com`
   - `https://www.workbiblow.com`

---

## 💡 RECOMMANDATIONS

### Option Recommandée (Coût : $7/mois)

**Configuration** :
- Frontend : `workbiblow.com` → Vercel (gratuit)
- Backend : `api.workbiblow.com` → Render Starter ($7/mois)

**Avantages** :
- ✅ URL propre et professionnelle
- ✅ API séparée et organisée
- ✅ SSL/HTTPS automatique
- ✅ Pas de sommeil du service (Starter)

### Option Gratuite

**Configuration** :
- Frontend : `workbiblow.com` → Vercel (gratuit)
- Backend : `koundoul-backend.onrender.com` → Render Free

**Avantages** :
- ✅ Gratuit
- ✅ Frontend avec domaine personnalisé
- ⚠️ Backend peut s'endormir après 15 min d'inactivité

---

## 📞 SUPPORT

### Vercel
- Documentation : https://vercel.com/docs/concepts/projects/domains
- Support : https://vercel.com/support

### Render
- Documentation : https://render.com/docs/custom-domains
- Support : https://render.com/docs/support

### DNS
- Consulter la documentation de votre registrar DNS
- Vérifier les enregistrements avec : https://dnschecker.org

---

## ✅ RÉSUMÉ RAPIDE

### Pour Configurer le Domaine Principal (Frontend)

1. **Vercel** → Settings → Domains → Add `workbiblow.com`
2. **DNS** → Ajouter les enregistrements fournis par Vercel
3. **Attendre** → Propagation DNS (5 min - 48h)
4. **Vérifier** → Site accessible sur `https://workbiblow.com`

### Pour Configurer le Sous-domaine API (Backend)

1. **Render** → Upgrader vers Starter ($7/mois)
2. **Render** → Settings → Custom Domain → Add `api.workbiblow.com`
3. **DNS** → Ajouter CNAME pour `api`
4. **Render** → Mettre à jour `CORS_ORIGIN` avec `https://workbiblow.com`
5. **Vercel** → Mettre à jour `VITE_API_URL` avec `https://api.workbiblow.com`

---

**Dernière mise à jour** : 2025-12-06  
**Statut** : ⏳ En attente de configuration


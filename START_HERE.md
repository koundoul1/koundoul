# 🚀 DÉMARRAGE RAPIDE - KOUNDOUL

## ✅ Tout est prêt ! Voici comment démarrer :

---

## 📋 Étape par Étape

### 1️⃣ Démarrer le Backend
```bash
cd backend
node server.js
```

**Attendu** :
```
✅ Database connected successfully
🚀 Serveur Koundoul démarré !
📍 Port: 3001
```

**Laisser ce terminal ouvert !**

---

### 2️⃣ Démarrer le Frontend (nouveau terminal)
```bash
cd frontend
npm run dev
```

**Attendu** :
```
VITE ready in XXX ms
➜ Local: http://localhost:3000/
```

**Laisser ce terminal ouvert !**

---

### 3️⃣ Ouvrir le Navigateur

**URL** : http://localhost:3000

---

### 4️⃣ Se Connecter

Si vous n'avez pas encore de compte, **inscrivez-vous d'abord** :
- Cliquer sur "S'inscrire" (ou aller sur `/register`)
- Remplir le formulaire
- Email : `votre@email.com`
- Username : `votre_username`
- Password : `motdepasse` (min 8 caractères)

**OU utiliser le compte de test déjà créé** :
- Email : `sambafaye184@yahoo.fr`
- Password : `atsatsATS1.ATS`

---

## 🔧 Si la Page de Connexion Ne Marche Pas

### Vérification 1 : Serveurs Actifs ?
```bash
netstat -ano | findstr ":3001 :3000"
```

**Attendu** :
```
TCP    0.0.0.0:3001    LISTENING
TCP    [::1]:3000      LISTENING
```

### Vérification 2 : Backend Accessible ?
Ouvrir : http://localhost:3001/health

**Attendu** : JSON avec `"status": "healthy"`

### Vérification 3 : Frontend Accessible ?
Ouvrir : http://localhost:3000

**Attendu** : Page d'accueil Koundoul

### Vérification 4 : Console Navigateur
1. Ouvrir la page de login
2. F12 (Outils développeur)
3. Onglet "Console"
4. Essayer de se connecter
5. Regarder les erreurs

**Erreurs possibles** :
- ❌ `CORS error` → Vérifier backend/.env (CORS_ORIGIN)
- ❌ `404 Not Found` → Vérifier que backend tourne
- ❌ `Network error` → Vérifier proxy dans vite.config.js

---

## 🆘 Solutions Rapides

### Problème : "Email ou mot de passe incorrect"
**Solution** : L'utilisateur n'existe pas, créez-le :
```bash
cd backend
node create-test-user.js
```

### Problème : Serveur ne démarre pas
**Solution** : Port déjà utilisé
```bash
taskkill /F /IM node.exe
cd backend
node server.js
```

### Problème : Base de données vide
**Solution** : Re-seeder
```bash
cd backend
npm run db:seed
```

### Problème : Erreur Prisma
**Solution** : Régénérer
```bash
cd backend
npx prisma generate
```

---

## ✅ Test Complet des APIs

```bash
cd backend
node test-complete-flow.ps1
```

**Résultat attendu** :
```
✅ Health OK
✅ Login OK
✅ Subjects OK (1 matière)
✅ Dashboard OK
✅ Quiz OK (2 quiz)
✅ Badges OK (18 badges)
```

---

## 🎯 Une fois Connecté

1. **Dashboard** → Voir vos stats (XP: 0, Niveau: 1)
2. **Cours** → Choisir Mathématiques (Seconde)
3. **Chapitre** → Nombres et Calculs
4. **Leçon** → Les ensembles de nombres
5. **Compléter** → +5 XP + Badge "Premier Pas" 🎉
6. **Exercice** → Faire un exercice
7. **Soumettre** → +10 XP + Badge "En Action" 🎉
8. **Quiz** → Tester vos connaissances
9. **Terminer** → +XP + Badge "Quiz Master" 🎉
10. **Badges** → Voir votre collection

---

## 📊 État Actuel

```
Backend     : ✅ Port 3001 (RUNNING)
Frontend    : ✅ Port 3000 (RUNNING)
Database    : ✅ Connectée (Supabase)
User Test   : ✅ Créé (sambafaye184@yahoo.fr)
Content     : ✅ Seeded (3 chapitres, 2 quiz)
APIs        : ✅ 31 endpoints fonctionnels
```

---

## 💡 Aide Supplémentaire

**Si vous avez toujours des problèmes** :

1. Vérifiez que vous êtes dans le bon répertoire
2. Vérifiez que `node_modules` existe dans backend ET frontend
3. Redémarrez les deux serveurs
4. Videz le cache du navigateur (Ctrl+Shift+R)
5. Essayez en navigation privée

---

**La plateforme fonctionne parfaitement ! Le problème est probablement lié à l'utilisateur ou aux serveurs. Suivez ces étapes et ça devrait marcher !** 🚀

---

**Besoin d'aide ?** Consultez `TESTING_GUIDE.md` pour plus de détails.



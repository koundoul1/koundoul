# 🔍 DEBUG - Page de Connexion Koundoul

## 🎯 Diagnostic Complet

---

## ✅ Checklist de Vérification

### 1. Backend Fonctionne ?
```bash
cd backend
node server.js
```

**Attendu dans le terminal** :
```
✅ Database connected successfully
🚀 Serveur Koundoul démarré !
📍 Port: 3001
```

**Test API directement** :
```bash
curl http://localhost:3001/health
```

**Attendu** :
```json
{"success":true,"data":{"status":"healthy"}}
```

---

### 2. Frontend Fonctionne ?
```bash
cd frontend
npm run dev
```

**Attendu** :
```
VITE ready
Local: http://localhost:3000/
```

**Ouvrir le navigateur** : http://localhost:3000

---

### 3. L'Utilisateur Existe ?

**Vérifier avec l'API** :
```bash
cd backend
node test-login.js
```

**Si ça échoue** → L'utilisateur n'existe pas, créez-le :
```bash
node create-test-user.js
```

**Résultat attendu** :
```
✅ Utilisateur créé avec succès !
Email: sambafaye184@yahoo.fr
```

---

### 4. Console Navigateur

**Ouvrir les DevTools** :
1. Page de login → F12
2. Onglet **Console**
3. Essayer de se connecter
4. Regarder les messages

**Messages normaux** :
```
GET /api/content/subjects 200
POST /api/auth/login 200
```

**Messages d'erreur possibles** :

#### ❌ Erreur 1 : CORS
```
Access to fetch at 'http://localhost:3001/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solution** : Vérifier `backend/.env` :
```env
CORS_ORIGIN="http://localhost:3000,http://localhost:3002,http://localhost:5173"
```

---

#### ❌ Erreur 2 : 404 Not Found
```
POST http://localhost:3001/api/auth/login 404
```

**Solution** : Le backend ne tourne pas ou la route n'existe pas.

**Vérifier** :
```bash
cd backend
grep -r "router.post('/login'" src/modules/auth/
```

---

#### ❌ Erreur 3 : 500 Internal Server Error
```
POST http://localhost:3001/api/auth/login 500
```

**Solution** : Erreur dans le code backend.

**Regarder les logs backend** dans le terminal où tourne `node server.js`

---

#### ❌ Erreur 4 : Network Error
```
TypeError: Failed to fetch
```

**Solution** : Le backend ne répond pas.

**Vérifier** :
```bash
netstat -ano | findstr ":3001"
```

Si vide → Backend ne tourne pas.

---

### 5. Vérifier la Configuration API

**Fichier** : `frontend/src/services/api.js`

**Vérifier que API_BASE est correct** :
```javascript
const API_BASE = 'http://localhost:3001/api';
```

**OU si vous utilisez Vite proxy** :
```javascript
const API_BASE = '/api'; // Proxy vers 3001
```

**Fichier** : `frontend/vite.config.js`

**Vérifier le proxy** :
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

---

### 6. Test Manuel de Login (Postman / Curl)

**Avec curl** :
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"sambafaye184@yahoo.fr\",\"password\":\"atsatsATS1.ATS\"}"
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {...},
    "token": "eyJhbGciOi..."
  }
}
```

---

### 7. Vérifier AuthContext

**Fichier** : `frontend/src/context/AuthContext.jsx`

**Tester la fonction login** :
```javascript
const login = async (email, password) => {
  dispatch({ type: AUTH_ACTIONS.LOGIN_START })
  
  try {
    console.log('🔐 Tentative de login:', email) // DEBUG
    const response = await api.auth.login({ email, password })
    console.log('✅ Réponse login:', response) // DEBUG
    
    // ... rest of code
  } catch (error) {
    console.error('❌ Erreur login:', error) // DEBUG
    // ... rest of code
  }
}
```

---

### 8. Vérifier la Page Login

**Fichier** : `frontend/src/pages/Login.jsx`

**Ajouter des logs** :
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  setErrors({})
  
  console.log('📝 Formulaire soumis:', formData) // DEBUG
  
  try {
    await login(formData.email, formData.password)
    console.log('✅ Login réussi dans composant') // DEBUG
  } catch (err) {
    console.error('❌ Erreur login dans composant:', err) // DEBUG
    setErrors({ submit: err.message })
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🔄 Processus de Debug Recommandé

### Étape 1 : Backend
```bash
# Terminal 1
cd backend
node server.js

# Vérifier que ça affiche :
# ✅ Database connected
# 🚀 Serveur démarré sur port 3001
```

### Étape 2 : Test API
```bash
# Terminal 2
cd backend
node test-login.js

# Si échec → Créer user
node create-test-user.js

# Re-tester
node test-login.js
```

### Étape 3 : Frontend
```bash
# Terminal 3
cd frontend
npm run dev

# Ouvrir http://localhost:3000
```

### Étape 4 : Tester Login
1. Aller sur `/login`
2. F12 → Console
3. Entrer :
   - Email : `sambafaye184@yahoo.fr`
   - Password : `atsatsATS1.ATS`
4. Cliquer "Se connecter"
5. Regarder :
   - Console navigateur (messages)
   - Terminal backend (logs)

---

## 🆘 Solutions Rapides

### Tout Redémarrer
```bash
# Tuer tous les processus Node
taskkill /F /IM node.exe

# Redémarrer backend
cd backend
node server.js

# Nouveau terminal - Frontend
cd frontend
npm run dev
```

### Recréer l'Utilisateur
```bash
cd backend
node create-test-user.js
```

### Re-seeder la Base
```bash
cd backend
npm run db:seed
```

### Vider le Cache Navigateur
- Chrome : Ctrl+Shift+Delete → Tout effacer
- OU navigation privée : Ctrl+Shift+N

---

## 📊 État Actuel Vérifié

✅ **Backend** : Fonctionne sur port 3001  
✅ **API Login** : Répond correctement  
✅ **User Test** : Créé avec succès  
✅ **Database** : Connectée et seeded  
✅ **Frontend** : Tourne sur port 3000  

**Le problème est donc probablement** :
1. L'utilisateur n'existe plus (solution : `node create-test-user.js`)
2. Mauvais mot de passe (utiliser exactement : `atsatsATS1.ATS`)
3. Cache navigateur (vider ou mode privé)
4. Frontend pas redémarré après changement

---

## ✅ Test Final

**Script tout-en-un** :
```bash
cd backend
powershell -File test-complete-flow.ps1
```

**Si TOUS les tests passent** → Backend OK, problème frontend.  
**Si tests échouent** → Noter l'erreur exacte et corriger.

---

**La plateforme fonctionne ! Si vous suivez ces étapes, vous trouverez le problème.** 🎯



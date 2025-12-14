# 🔄 CHANGEMENT DE PORT - FRONTEND KOUNDOUL

**Date**: 9 novembre 2025  
**Statut**: ✅ CONFIGURATION MODIFIÉE

---

## 🎯 OBJECTIF

Changer le port du frontend vers **3002** car les ports 3000 et 3001 sont occupés par d'autres projets.

---

## ✅ MODIFICATIONS APPLIQUÉES

### 1. Configuration Vite (`frontend/vite.config.js`)
```javascript
server: {
  port: 3002,  // ✅ Changé de 3000/3001 à 3002
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // ✅ Backend sur port 5000
      changeOrigin: true,
      secure: false
    }
  }
}
```

### 2. Script `finaliser-coach-universel.ps1`
- ✅ Port frontend : **3002**
- ✅ URL navigateur : `http://localhost:3002`
- ✅ Backend API : `http://localhost:5000`

### 3. Script `demarrer-koundoul.ps1`
- ✅ URL navigateur : `http://localhost:3002/login`

### 4. Script `REDEMARRER-FRONTEND-PORT-3002.ps1`
- ✅ Nouveau script pour redémarrer facilement sur le port 3002

---

## 📊 CONFIGURATION FINALE

| Service | Port | URL |
|---------|------|-----|
| **Backend API** | 5000 | `http://localhost:5000` |
| **Frontend App** | **3002** | `http://localhost:3002` |
| **Coach Virtuel** | **3002** | `http://localhost:3002/coach` |
| **Solver** | **3002** | `http://localhost:3002/solver` |
| **Dashboard** | **3002** | `http://localhost:3002/dashboard` |
| **Exercices** | **3002** | `http://localhost:3002/exercices` |
| **Défi** | **3002** | `http://localhost:3002/defi` |

---

## 🚀 DÉMARRAGE

### Option 1 : Script automatique complet
```powershell
.\finaliser-coach-universel.ps1
```

### Option 2 : Redémarrer uniquement le frontend
```powershell
.\REDEMARRER-FRONTEND-PORT-3002.ps1
```

### Option 3 : Manuel
```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Le frontend démarrera automatiquement sur **http://localhost:3002**

---

## ✅ VÉRIFICATION

1. ✅ Ouvrir `http://localhost:3002` dans le navigateur
2. ✅ L'application devrait se charger correctement
3. ✅ Le backend API sera accessible via le proxy sur `/api`

---

## 🔧 NOTES IMPORTANTES

- ✅ Le port **3002** est maintenant utilisé pour le frontend
- ✅ Les ports **3000** et **3001** restent libres pour vos autres projets
- ✅ Le backend reste sur le port **5000**
- ✅ Tous les liens internes utilisent des chemins relatifs (`/login`, `/dashboard`, etc.)

---

*Configuration mise à jour le 9 novembre 2025*  
*Koundoul Platform - Frontend sur port 3002*  
*Ports 3000 et 3001 libres pour autres projets*

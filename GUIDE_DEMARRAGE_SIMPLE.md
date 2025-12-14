# 🚀 GUIDE DE DÉMARRAGE SIMPLE - KOUNDOUL

## ⚡ MÉTHODE LA PLUS SIMPLE

### Double-clique sur `DEMARRER-KOUNDOUL.bat`

C'est tout ! Le script va :
1. Démarrer le backend (port 5000)
2. Démarrer le frontend (port 3000)
3. Ouvrir 2 fenêtres de terminal

---

## 📋 MÉTHODE MANUELLE

### Étape 1 : Démarrer le backend

Ouvre un terminal PowerShell et exécute :
```bash
cd C:\Users\conta\koundoul\backend
node server.js
```

Tu devrais voir :
```
✅ Database connected successfully
🚀 Server running on port 5000
```

**⚠️ LAISSE CE TERMINAL OUVERT !**

---

### Étape 2 : Démarrer le frontend

Ouvre un **NOUVEAU** terminal PowerShell et exécute :
```bash
cd C:\Users\conta\koundoul\frontend
npm run dev
```

Tu devrais voir :
```
VITE ready in XXX ms
Local: http://localhost:3000
```

---

### Étape 3 : Accéder à la plateforme

Ouvre ton navigateur et va sur :
👉 **http://localhost:3000**

---

## 🆘 EN CAS DE PROBLÈME

### Erreur : "Cannot find module 'server.js'"
**Cause** : Tu es dans le mauvais dossier  
**Solution** : Assure-toi d'être dans `backend/` avant de lancer `node server.js`

### Erreur : "Port 5000 already in use"
**Cause** : Le backend est déjà en cours d'exécution  
**Solution** : Ferme l'autre terminal ou utilise `Ctrl+C` pour arrêter le serveur

### Erreur : "Port 3000 already in use"
**Cause** : Le frontend est déjà en cours d'exécution  
**Solution** : Ferme l'autre terminal ou utilise `Ctrl+C` pour arrêter le serveur

### Erreur de connexion DB
**Cause** : Fichier `.env` incorrect  
**Solution** : Vérifie que `backend/.env` contient la bonne URL (port 6543)

---

## ✅ VÉRIFICATION QUE TOUT MARCHE

### Backend (http://localhost:5000)
```bash
# Dans un terminal
curl http://localhost:5000/health
```
Devrait retourner : `{"success":true,"message":"Serveur en cours d'exécution"}`

### Frontend (http://localhost:3000)
Ouvre ton navigateur et va sur http://localhost:3000  
Tu devrais voir la page d'accueil de Koundoul

---

## 🎯 RÉSUMÉ RAPIDE

```
1. Double-clique sur DEMARRER-KOUNDOUL.bat
   OU
   Terminal 1: cd backend && node server.js
   Terminal 2: cd frontend && npm run dev

2. Ouvre http://localhost:3000

3. Profite de ta plateforme ! 🎉
```

---

## 📞 PORTS UTILISÉS

- **Backend** : http://localhost:5000
- **Frontend** : http://localhost:3000
- **Base de données** : Supabase (cloud)

---

**C'est tout ! Bon apprentissage sur Koundoul ! 🎓✨**










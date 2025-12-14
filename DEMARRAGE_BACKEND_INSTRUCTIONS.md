# 🚀 DÉMARRAGE BACKEND - INSTRUCTIONS

## ⚠️ PROBLÈME ACTUEL

Le backend ne démarre pas sur le port 3001.

## 🔧 SOLUTION

### **Méthode 1 : Terminal dédié (RECOMMANDÉE)**

1. **Ouvrez un nouveau terminal PowerShell**
2. **Naviguez vers le backend** :
   ```powershell
   cd C:\Users\conta\koundoul\backend
   ```
3. **Démarrez le serveur** :
   ```powershell
   npm start
   ```
4. **Laissez ce terminal ouvert**
5. **Vérifiez les logs** pour voir si le serveur démarre correctement

Vous devriez voir :
```
🚀 Serveur Koundoul démarré sur le port 3001
✅ Base de données Prisma connectée
```

### **Méthode 2 : Utiliser le script automatisé**

```powershell
.\finaliser-coach-universel.ps1
```

Ce script :
- Tue les anciens processus Node
- Démarre le backend
- Ouvre le navigateur

---

## 🧪 VÉRIFIER QUE LE BACKEND FONCTIONNE

### Dans le navigateur :
- http://localhost:3001/health

Vous devriez voir :
```json
{
  "success": true,
  "message": "Serveur en cours d'exécution",
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

### Tester les banques :
- http://localhost:3001/api/question-banks

Vous devriez voir les 18 banques.

---

## ✅ UNE FOIS LE BACKEND DÉMARRÉ

### Frontend dans un autre terminal :

```powershell
cd C:\Users\conta\koundoul\frontend
npm run dev
```

Puis accédez à http://localhost:3000

---

## 🎯 RÉSUMÉ

**2 terminaux nécessaires :**
1. **Terminal 1** : Backend (`cd backend && npm start`)
2. **Terminal 2** : Frontend (`cd frontend && npm run dev`)

**Gardez les 2 terminaux ouverts pendant les tests !**










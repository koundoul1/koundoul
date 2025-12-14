# 🚀 Démarrage Rapide - Koundoul

## ⚡ En 3 Étapes

### 1️⃣ Démarrer le Backend
```bash
cd backend
node server.js
```

✅ Attendez de voir :
```
🚀 Serveur Koundoul démarré !
📍 Port: 3001
```

### 2️⃣ Démarrer le Frontend
```bash
# Nouveau terminal
cd frontend  
npm run dev
```

✅ Attendez de voir :
```
➜ Local: http://localhost:3002/
```

### 3️⃣ Ouvrir l'Application
- Naviguer vers : **http://localhost:3002**
- Email : `sambafaye184@yahoo.fr`
- Password : `atsatsATS1.ATS`

---

## 📚 Parcours de Test Recommandé

1. **Connexion** → Dashboard s'affiche
2. **Cliquer "Cours"** → Liste des matières
3. **Choisir "Mathématiques"** + Niveau "Seconde"
4. **Ouvrir "Nombres et Calculs"** → Voir leçons/exercices
5. **Lire la leçon** "Les ensembles de nombres"
6. **Marquer comme complété** → +5 XP
7. **Faire l'exercice** "Identifier les ensembles"
8. **Soumettre une réponse** → Voir correction
9. **Retour Dashboard** → Voir progression mise à jour

---

## 🔧 Commandes Utiles

### Arrêter tous les serveurs
```bash
taskkill /F /IM node.exe
```

### Voir les processus Node
```bash
netstat -ano | findstr ":3001 :3002"
```

### Régénérer Prisma
```bash
cd backend
npx prisma generate
```

### Re-seed la base
```bash
cd backend
npm run db:seed
```

---

## ✅ Vérification Rapide

### Backend OK ?
```bash
curl http://localhost:3001/health
```

### Matières chargées ?
```bash
curl http://localhost:3001/api/content/subjects
```

### Frontend OK ?
Ouvrir : http://localhost:3002

---

## 🎯 Ce que tu peux faire maintenant

✅ **Apprendre** : 4 leçons de maths disponibles  
✅ **Pratiquer** : 5 exercices interactifs  
✅ **Progresser** : Gagne des XP et monte de niveau  
✅ **Résoudre** : Utilise l'IA pour résoudre des problèmes  
✅ **Suivre** : Consulte ton dashboard de progression  

---

## 📞 Support

Voir les fichiers de documentation :
- `TESTING_GUIDE.md` - Guide de test complet
- `PROJECT_STATUS.md` - État du projet
- `CORRECTIONS_APPLIED.md` - Détail des corrections

---

**Tout est prêt ! Bon apprentissage ! 🎓✨**



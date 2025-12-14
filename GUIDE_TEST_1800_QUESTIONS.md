# 🎮 GUIDE : TESTER LES 1800 QUESTIONS

## ✅ BACKEND DÉMARRÉ

Le backend est démarré en arrière-plan sur http://localhost:3001

---

## 🚀 DÉMARRER LE FRONTEND

### Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

Le frontend démarrera sur http://localhost:3000

---

## 🎯 TESTER LES BANQUES DE QUESTIONS

### 1. Se connecter
- Accéder à http://localhost:3000/login
- Utiliser vos identifiants de test

### 2. Accéder aux banques
- Cliquer sur le menu ou aller à http://localhost:3000/question-banks
- Vous verrez **18 banques** :
  - 9 banques QCM (900 questions)
  - 9 banques Exercices (900 questions)

### 3. Filtrer les banques
- Par matière : Math, Physique, Chimie
- Par niveau : Seconde, Première, Terminale
- Par type : QCM, Exercices

### 4. Jouer un QCM
- Cliquer sur une banque QCM (ex: MS-QCM)
- Répondre aux questions
- Voir le feedback immédiat
- Lire les explications
- Suivre le score et le timer
- Terminer le quiz

### 5. Faire des exercices
- Cliquer sur une banque Exercices (ex: MS-EX)
- Lire l'énoncé
- Voir les indices
- Consulter la solution étape par étape

---

## 🔍 VÉRIFIER LES DONNÉES

### Via l'API Backend

```bash
# Liste des banques
curl http://localhost:3001/api/question-banks

# Détail d'une banque
curl http://localhost:3001/api/question-banks/MS-QCM

# 10 QCM aléatoires Math Seconde
curl http://localhost:3001/api/question-banks/MS-QCM/qcm/random?limit=10

# Tous les exercices Chimie Terminale
curl http://localhost:3001/api/question-banks/CT-EX/exercises
```

---

## 📊 CE QUE VOUS DEVRIEZ VOIR

### Page Banques (`/question-banks`)
- 4 cartes de statistiques en haut :
  - **Banques** : 18
  - **Total QCM** : 900
  - **Exercices** : 900
  - **Total** : 1800
- Filtres fonctionnels
- 18 cartes de banques cliquables

### Page QCM (`/question-banks/MS-QCM`)
- Titre de la banque
- Barre de progression
- Question avec 4 options (A, B, C, D)
- Timer en haut à droite
- Score cumulatif
- Feedback vert (correct) ou rouge (incorrect)
- Explication après chaque réponse
- Boutons Précédent/Suivant
- Bouton Terminer sur la dernière question

---

## 🐛 SI PROBLÈME

### Erreur "Failed to fetch"
→ Vérifiez que le backend est démarré sur le port 3001

### Erreur "Aucune banque"
→ Relancez `node scripts/import_question_banks.js`

### Page blanche
→ Vérifiez la console du navigateur (F12)

---

## 🎯 COMMANDES UTILES

```bash
# Vérifier l'état de l'import
cd scripts
node test_question_banks.js

# Réimporter si besoin
node import_question_banks.js

# Vérifier les détails
node verify_question_banks.js
```

---

## 🎉 PROFITEZ !

**1800 questions opérationnelles** couvrant tout le programme lycée !

**Testez, jouez, apprenez ! 🚀**










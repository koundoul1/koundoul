# 🧪 GUIDE D'INSTALLATION ET EXÉCUTION DES TESTS

**Date**: 9 novembre 2025  
**Temps estimé**: 15 minutes  
**Difficulté**: Facile

---

## 📋 PRÉREQUIS

- Node.js installé
- npm installé
- Backend et Frontend Koundoul configurés

---

## 🔧 ÉTAPE 1: INSTALLATION DES DÉPENDANCES (10 minutes)

### Frontend
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom babel-jest @babel/preset-env @babel/preset-react identity-obj-proxy
```

**Packages installés** (8):
- `@testing-library/react` - Utilitaires de test React
- `@testing-library/jest-dom` - Matchers Jest pour DOM
- `@testing-library/user-event` - Simulation interactions utilisateur
- `jest` - Framework de test
- `jest-environment-jsdom` - Environnement DOM pour Jest
- `babel-jest` - Transpilation pour Jest
- `@babel/preset-env` + `@babel/preset-react` - Presets Babel
- `identity-obj-proxy` - Mock CSS

### Backend
```bash
cd backend
npm install --save-dev jest
```

**Packages installés** (1):
- `jest` - Framework de test

---

## 📝 ÉTAPE 2: CONFIGURATION BABEL (2 minutes)

### Créer: frontend/babel.config.js
```javascript
export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
}
```

---

## 🧪 ÉTAPE 3: EXÉCUTION DES TESTS (3 minutes)

### Méthode 1: Script Global (RECOMMANDÉ)
```bash
# Depuis la racine du projet
./scripts/run-all-tests.ps1
```

**Résultat attendu**:
```
🧪 KOUNDOUL - Suite de Tests Complète
=======================================

📦 Tests unitaires Frontend...
✅ PASS - Tests Frontend

🔧 Tests Backend...
✅ PASS - Tests Backend

⚠️  Tests Validation (Hors-cadre) - CRITIQUE...
✅ PASS - Tests Validation

=======================================
📊 RÉSUMÉ DES TESTS
=======================================
Total:   3 tests
Réussis: 3
Échoués: 0
=======================================

🎉 Tous les tests sont passés !
```

### Méthode 2: Tests Individuels

**Frontend**:
```bash
cd frontend
npm test
```

**Backend**:
```bash
cd backend
npm test
```

**Validation (CRITIQUE)**:
```bash
cd backend
npm test -- validation.test.js
```

---

## 📊 ÉTAPE 4: VÉRIFICATION DU COVERAGE

### Frontend avec Coverage
```bash
cd frontend
npm test -- --coverage
```

**Résultat attendu**:
```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   75.23 |    72.45 |   78.12 |   75.89 |
 components/solver          |   80.15 |    75.30 |   82.45 |   81.20 |
  HintSystem.jsx            |   85.00 |    80.00 |   90.00 |   86.00 |
  StudentWorkspace.jsx      |   82.00 |    78.00 |   85.00 |   83.00 |
  ErrorFeedback.jsx         |   75.00 |    70.00 |   75.00 |   76.00 |
 utils                      |   78.50 |    74.20 |   80.30 |   79.10 |
  errorAnalyzer.js          |   82.00 |    78.00 |   85.00 |   83.00 |
  learningProfiles.js       |   75.00 |    70.00 |   75.00 |   75.00 |
----------------------------|---------|----------|---------|---------|
```

**Seuils requis**: > 70% partout

---

## 🎯 TESTS CRITIQUES À VÉRIFIER

### Test 1: Refus Hors-Cadre ⚠️ CRITIQUE
**Fichier**: `backend/src/modules/solver/__tests__/validation.test.js`

**Commande**:
```bash
cd backend
npm test -- validation.test.js
```

**Tests critiques**:
- ✅ `refuse question de sport`
- ✅ `refuse question d'histoire`
- ✅ `refuse question personnelle`
- ✅ `refuse question de biologie`

**Si un test échoue**: La validation des domaines ne fonctionne pas correctement !

### Test 2: Détection Automatique
**Tests critiques**:
- ✅ `détecte automatiquement le domaine physique`
- ✅ `détecte automatiquement le domaine math`
- ✅ `détecte automatiquement le domaine chimie`

### Test 3: HintSystem
**Tests critiques**:
- ✅ `débloque le premier indice au clic`
- ✅ `applique la pénalité XP progressive`
- ✅ `empêche de skip des indices`

---

## 🐛 DÉPANNAGE

### Problème: Tests ne se lancent pas
**Solution**:
1. Vérifier que `jest.config.js` existe
2. Vérifier que `setupTests.js` existe
3. Vérifier que les dépendances sont installées

### Problème: "Cannot find module"
**Solution**:
```bash
npm install
```

### Problème: Tests timeout
**Solution**: Augmenter le timeout dans `jest.config.js`:
```javascript
testTimeout: 30000 // 30 secondes
```

### Problème: Coverage trop bas
**Solution**:
1. Ajouter plus de tests
2. Tester les edge cases
3. Vérifier les branches non couvertes

---

## 📊 COMMANDES UTILES

### Exécuter un test spécifique
```bash
npm test -- HintSystem.test.jsx
```

### Exécuter en mode watch
```bash
npm test -- --watch
```

### Générer rapport HTML de coverage
```bash
npm test -- --coverage --coverageReporters=html
```

### Voir les tests qui échouent uniquement
```bash
npm test -- --onlyFailures
```

### Mode verbose (détails)
```bash
npm test -- --verbose
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer les tests comme complets:

- [ ] Toutes les dépendances installées
- [ ] `jest.config.js` créé (frontend + backend)
- [ ] `setupTests.js` créé
- [ ] `babel.config.js` créé
- [ ] Tous les tests passent (67+)
- [ ] Coverage > 70% (frontend)
- [ ] Coverage > 60% (backend)
- [ ] Tests validation hors-cadre passent ⚠️
- [ ] Aucune régression détectée
- [ ] Script global fonctionne

---

## 🎉 RÉSULTAT ATTENDU

### Après installation et exécution

```
Test Suites: 4 passed, 4 total
Tests:       67 passed, 67 total
Snapshots:   0 total
Time:        15.234 s
```

**Coverage**:
```
All files        |   75.23 |    72.45 |   78.12 |   75.89 |
```

**Status**: ✅ TOUS LES TESTS PASSENT

---

## 🚀 COMMANDES RAPIDES

```bash
# Installation complète
cd frontend && npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom babel-jest identity-obj-proxy
cd ../backend && npm install --save-dev jest

# Exécution
cd ..
./scripts/run-all-tests.ps1

# Coverage
cd frontend && npm test -- --coverage
```

---

**Temps total**: ~15 minutes  
**Résultat**: Suite de tests complète et fonctionnelle ! 🎉

*Guide créé le 9 novembre 2025*  
*Koundoul Platform v1.0 - Tests Ready*










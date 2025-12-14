# 🚀 GUIDE D'INTÉGRATION RAPIDE - BACKEND OPTIMISÉ

**Temps estimé**: 10 minutes  
**Difficulté**: Facile  
**Prérequis**: Backend Koundoul existant

---

## 📋 CHECKLIST RAPIDE

- [ ] Créer le dossier `prompts/`
- [ ] Copier `validation.js`
- [ ] Copier `guidedMode.js`
- [ ] Remplacer `solver.controller.js`
- [ ] Modifier `solver.service.js` (4 lignes)
- [ ] Tester l'API
- [ ] Vérifier les logs

---

## 🔧 ÉTAPE 1: CRÉER LE DOSSIER (30 secondes)

```bash
cd backend/src/modules/solver
mkdir prompts
```

---

## 📁 ÉTAPE 2: COPIER LES FICHIERS (1 minute)

### Fichier 1: validation.js
```bash
# Copier depuis:
backend/src/modules/solver/prompts/validation.js

# Vers:
backend/src/modules/solver/prompts/validation.js
```

### Fichier 2: guidedMode.js
```bash
# Copier depuis:
backend/src/modules/solver/prompts/guidedMode.js

# Vers:
backend/src/modules/solver/prompts/guidedMode.js
```

### Fichier 3: solver.controller.js
```bash
# Backup de l'ancien
mv backend/src/modules/solver/solver.controller.js backend/src/modules/solver/solver.controller.backup.js

# Copier le nouveau
cp backend/src/modules/solver/solver.controller.modified.js backend/src/modules/solver/solver.controller.js
```

---

## ✏️ ÉTAPE 3: MODIFIER solver.service.js (5 minutes)

Ouvrir `backend/src/modules/solver/solver.service.js`

### Modification 1: solveProblem()
**Ligne 10** - Ajouter le paramètre `customPrompt`:
```javascript
// AVANT
async solveProblem(userId, input, domain, level) {

// APRÈS
async solveProblem(userId, input, domain, level, customPrompt = null) {
```

**Ligne 15** - Passer customPrompt à callGeminiAPI:
```javascript
// AVANT
const solution = await this.callGeminiAPI(input, domain, level);

// APRÈS
const solution = await this.callGeminiAPI(input, domain, level, customPrompt);
```

### Modification 2: solveProblemAnonymous()
**Ligne 295** - Ajouter le paramètre `customPrompt`:
```javascript
// AVANT
async solveProblemAnonymous(input, domain, level) {

// APRÈS
async solveProblemAnonymous(input, domain, level, customPrompt = null) {
```

**Ligne 300** - Passer customPrompt à callGeminiAPI:
```javascript
// AVANT
const solution = await this.callGeminiAPI(input, domain, level);

// APRÈS
const solution = await this.callGeminiAPI(input, domain, level, customPrompt);
```

### Modification 3: callGeminiAPI()
**Ligne 70** - Ajouter le paramètre `customPrompt`:
```javascript
// AVANT
async callGeminiAPI(input, domain, level) {

// APRÈS
async callGeminiAPI(input, domain, level, customPrompt = null) {
```

**Ligne 175** - Utiliser customPrompt si fourni:
```javascript
// AVANT
const prompt = `${systemPrompt}\n\n${userPrompt}`;

// APRÈS
const prompt = customPrompt || `${systemPrompt}\n\n${userPrompt}`;
```

### Modification 4: Améliorer generationConfig (OPTIONNEL)
**Ligne 191-196** - Améliorer les paramètres:
```javascript
// AVANT
generationConfig: {
  temperature: 0.1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
},

// APRÈS (OPTIONNEL - déjà bon)
generationConfig: {
  temperature: 0.4,        // Meilleur équilibre
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 4096,  // Suffisant pour la plupart des cas
  candidateCount: 1
},
```

---

## 🧪 ÉTAPE 4: TESTER (3 minutes)

### Test 1: Question Mathématiques
```bash
curl -X POST http://localhost:3001/api/solver/solve \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Résoudre x² + 2x + 1 = 0",
    "domain": "math",
    "level": "medium"
  }'
```

**Attendu**: Réponse JSON avec solution

### Test 2: Question Hors Cadre
```bash
curl -X POST http://localhost:3001/api/solver/solve \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Qui a gagné la coupe du monde?",
    "domain": "general",
    "level": "easy"
  }'
```

**Attendu**: Erreur 400 avec message "out_of_scope"

### Test 3: Mode Guidé avec Profil
```bash
curl -X POST http://localhost:3001/api/solver/solve \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Calculer la dérivée de x³",
    "domain": "math",
    "level": "medium",
    "guidedMode": true,
    "learningProfile": "visual"
  }'
```

**Attendu**: Réponse structurée en 5 étapes avec hints

---

## ✅ ÉTAPE 5: VÉRIFICATION (1 minute)

### Vérifier les logs
```bash
# Dans le terminal du backend, chercher:
✅ "🔍 Solver request:"
✅ "✅ Problem solved"
❌ Pas d'erreurs de validation
```

### Vérifier la structure de réponse
La réponse doit contenir:
```json
{
  "success": true,
  "message": "Problème résolu avec succès",
  "data": {
    "solution": {...},
    "xpGained": 10,
    "domainUsed": "math",
    "warning": null
  }
}
```

---

## 🎯 TESTS COMPLETS

### Scénarios à tester

| Test | Input | Domain | Résultat Attendu |
|------|-------|--------|------------------|
| ✅ Math simple | "2x + 3 = 7" | math | Solution correcte |
| ✅ Physique | "F = ma avec m=5kg, a=2m/s²" | physics | Solution avec unités |
| ✅ Chimie | "Équilibrer H2 + O2 → H2O" | chemistry | Équation équilibrée |
| ❌ Histoire | "Qui est Napoléon?" | general | Erreur out_of_scope |
| ❌ Sport | "Règles du football" | general | Erreur out_of_scope |
| ❌ Trop court | "x=2" | math | Erreur validation |
| ✅ Auto-détection | "Calculer la force..." | general | Domaine suggéré: physics |
| ✅ Mode guidé | Avec guidedMode=true | math | Structure 5 étapes |
| ✅ Profil visuel | Avec learningProfile="visual" | math | Instructions visuelles |

---

## 🐛 DÉPANNAGE

### Erreur: "Cannot find module './prompts/validation.js'"
**Solution**: Vérifier que le dossier `prompts/` existe et contient les fichiers

### Erreur: "validateDomain is not a function"
**Solution**: Vérifier l'import dans solver.controller.js:
```javascript
import { validateDomain, validateInput } from './prompts/validation.js';
```

### Erreur: "generateGuidedPrompt is not a function"
**Solution**: Vérifier l'import dans solver.controller.js:
```javascript
import generateGuidedPrompt from './prompts/guidedMode.js';
```

### Les questions hors cadre passent quand même
**Solution**: Vérifier que la validation est bien appelée AVANT l'appel à Gemini

### Le customPrompt n'est pas utilisé
**Solution**: Vérifier que `callGeminiAPI()` utilise bien:
```javascript
const prompt = customPrompt || `${systemPrompt}\n\n${userPrompt}`;
```

---

## 📊 RÉSULTAT ATTENDU

### Avant l'optimisation
- ❌ Accepte toutes les questions
- ❌ Pas d'adaptation au profil
- ❌ Réponses génériques
- ❌ Pas de validation

### Après l'optimisation
- ✅ Refuse poliment les questions hors cadre
- ✅ Adapte au profil d'apprentissage
- ✅ Réponses structurées en 5 étapes
- ✅ Validation multi-niveaux
- ✅ Détection automatique du domaine
- ✅ Hints progressifs
- ✅ Erreurs courantes anticipées

---

## 🎉 FÉLICITATIONS !

Votre backend est maintenant optimisé avec:
- ✅ Validation stricte des domaines
- ✅ Prompts personnalisés
- ✅ Adaptation aux profils d'apprentissage
- ✅ Sécurité renforcée
- ✅ Réponses structurées

**Le système est prêt pour production !** 🚀

---

## 📞 SUPPORT

En cas de problème:
1. Vérifier les logs du backend
2. Tester avec curl
3. Vérifier les imports
4. Consulter `BACKEND_OPTIMIZATION_COMPLETE.md`

*Guide d'intégration créé le 9 novembre 2025*  
*Backend Optimization v1.0*










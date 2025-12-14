# 🎓 ARCHITECTURE DU COACH PÉDAGOGIQUE INTELLIGENT

## 📋 Vue d'Ensemble

Le Coach Pédagogique Intelligent est un système qui guide les élèves vers la solution sans jamais donner la réponse directement.

## 🎯 Principes Fondamentaux

1. **Ne jamais donner la solution directement**
2. **Guider l'élève vers la découverte**
3. **Adapter le guidage au profil de l'élève**
4. **Valider et encourager à chaque étape**

---

## 🔧 Architecture Technique

### 1. Capture & Reconnaissance

**Fichier**: `backend/src/utils/problem-input-parser.js` (à créer)

```javascript
class ProblemInputParser {
  async parse(input) {
    // Supporte : photo, texte, manuscrit, voix
    const extracted = await this.extractMathContent(input);
    const classified = await this.classifyProblem(extracted);
    
    return {
      problemType: classified.type,
      difficulty: classified.difficulty,
      concepts: classified.concepts,
      structure: this.analyzeStructure(extracted)
    };
  }
}
```

### 2. Analyse Pédagogique

**Fichier**: `backend/src/utils/pedagogical-analyzer.js` (à créer)

```javascript
class PedagogicalAnalyzer {
  async analyze(problem) {
    return {
      strategies: await this.identifyStrategies(problem),
      commonMistakes: await this.identifyCommonMistakes(problem),
      keyConcepts: await this.extractConcepts(problem),
      guidanceLevel: await this.recommendGuidanceLevel(problem)
    };
  }
}
```

### 3. Système de Guidage Adaptatif

**Fichier**: `backend/src/utils/adaptive-guidance.js` (à créer)

```javascript
class AdaptiveGuidance {
  async determineLevel(studentProfile, problem) {
    const mastery = this.calculateMastery(studentProfile, problem.concepts);
    const pastPerformance = await this.getPerformance(problem.type);
    
    if (mastery > 0.8 && pastPerformance > 0.75) {
      return 'AUTONOMOUS';  // Indices minimalistes
    } else if (mastery > 0.6) {
      return 'MODERATE';     // Guidage équilibré
    } else if (mastery > 0.4) {
      return 'EXTENSIVE';    // Guidage pas à pas
    } else {
      return 'REMEDIATION';  // Revoir les bases
    }
  }
  
  async adjustInRealTime(sessionData) {
    // Si bloqué > 2 min, augmenter le guidage
    if (sessionData.timeStuck > 120 && sessionData.attempts > 3) {
      this.increaseGuidance();
    }
    // Si réussite rapide, réduire le guidage
    if (sessionData.attempts <= 2 && sessionData.timeSpent < 60) {
      this.decreaseGuidance();
    }
  }
}
```

### 4. Système d'Indices Progressifs

**Fichier**: `backend/src/utils/hint-system.js` (à créer)

```javascript
class HintSystem {
  generateHints(problem) {
    return [
      {
        level: 1,
        type: 'question',
        content: "Quelle est la forme générale de ce type de problème ?",
        xpPenalty: 0
      },
      {
        level: 2,
        type: 'reminder',
        content: "Rappel : Tu peux utiliser la méthode X ou Y.",
        xpPenalty: 5
      },
      {
        level: 3,
        type: 'method',
        content: "Méthode suggérée : ...",
        xpPenalty: 10
      },
      {
        level: 4,
        type: 'partial',
        content: "Les premiers éléments sont ...",
        xpPenalty: 20
      },
      {
        level: 5,
        type: 'full',
        content: "Solution complète : ...",
        xpPenalty: 50
      }
    ];
  }
}
```

### 5. Validation Intelligente

**Fichier**: `backend/src/utils/smart-validator.js` (à créer)

```javascript
class SmartValidator {
  async validate(input, expected) {
    // 1. Validation syntaxique
    const syntaxCheck = this.checkSyntax(input);
    
    // 2. Validation mathématique
    const mathCheck = await this.checkMathematical(input, expected);
    
    // 3. Détection d'erreurs courantes
    const errorDetection = await this.detectCommonErrors(input, expected);
    
    return {
      isValid: mathCheck.isValid && syntaxCheck.isValid,
      feedback: this.generateFeedback(errorDetection),
      suggestions: errorDetection.howToFix
    };
  }
}
```

### 6. Détection d'Erreurs Courantes

**Fichier**: `backend/src/utils/error-detector.js` (à créer)

```javascript
const commonErrors = [
  {
    id: "sign-error-discriminant",
    pattern: /b²\+4ac/,
    explanation: "Le discriminant est b² - 4ac, pas plus !",
    howToFix: ["Utilise b² - 4ac", "Fais attention au signe"]
  },
  {
    id: "forgot-two-solutions",
    pattern: (input) => input.match(/x\s*=\s*[^,\n]+/g)?.length === 1,
    explanation: "Il y a deux solutions quand Δ > 0",
    howToFix: ["Utilise ± dans la formule", "Calcule x₁ et x₂"]
  }
  // ... autres erreurs
];

class ErrorDetector {
  async detect(input, problemType) {
    const detected = [];
    for (const error of commonErrors) {
      if (this.matches(error.pattern, input)) {
        detected.push(error);
      }
    }
    return detected;
  }
}
```

---

## 🎨 Interface Frontend

### Composant Principal: CoachInterface

**Fichier**: `frontend/src/pages/Coach.jsx` (à créer/mettre à jour)

Structure de l'interface :

```jsx
<div className="coach-container">
  {/* Zone de capture */}
  <CaptureZone 
    onCapture={handleCapture}
    modes={['photo', 'text', 'handwriting', 'voice']}
  />
  
  {/* Analyse du problème */}
  <ProblemAnalysis 
    analysis={problemAnalysis}
    difficulty={difficulty}
    estimatedTime={estimatedTime}
  />
  
  {/* Mode de guidage */}
  <GuidanceModeSelector
    options={['autonomous', 'moderate', 'extensive']}
    selected={guidanceMode}
    onChange={setGuidanceMode}
  />
  
  {/* Zone de travail interactive */}
  <InteractiveWorkspace
    currentPhase={currentPhase}
    question={currentQuestion}
    studentAnswer={studentAnswer}
    onAnswerChange={handleAnswerChange}
    validation={validation}
  />
  
  {/* Système d'indices */}
  <HintPanel
    hints={availableHints}
    currentLevel={hintLevel}
    onRequestHint={handleHintRequest}
    xpPenalty={hintXPPenalty}
  />
  
  {/* Progression */}
  <ProgressBar
    progress={progress}
    xpEarned={xpEarned}
    timeElapsed={timeElapsed}
  />
</div>
```

---

## 📊 Schéma de Base de Données

### Tables à Ajouter (si pas déjà présentes)

```prisma
model CoachSession {
  id              String   @id @default(cuid())
  userId          String
  problemInput    Json     // Photo, texte, etc.
  problemAnalysis Json     // Analyse du problème
  guidanceLevel   String   // AUTONOMOUS, MODERATE, EXTENSIVE, REMEDIATION
  currentPhase    String   // understanding, planning, execution, verification
  currentStep     Int
  progress        Int
  startTime       DateTime
  endTime         DateTime?
  totalTime       Int?     // en secondes
  score           Float?
  xpEarned        Int?
  status          String   // in_progress, completed, abandoned
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  student         User     @relation(fields: [userId], references: [id])
  interactions    CoachInteraction[]
  
  @@index([userId])
}

model CoachInteraction {
  id              String   @id @default(cuidbaik())
  sessionId       String
  phase           String
  type            String   // question, hint, validation, feedback
  content         Json
  studentResponse String?
  isCorrect       Boolean?
  hintLevel       Int?
  points          Int?
  timestamp       DateTime @default(now())
  
  session         CoachSession @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId])
}
```

---

## 🚀 Plan d'Implémentation

### Phase 1 : Fondations (1-2 jours)
- [x] Routes coach existantes
- [ ] Créer `problem-input-parser.js`
- [ ] Créer `pedagogical-analyzer.js`
- [ ] Créer `adaptive-guidance.js`

### Phase 2 : Guidage Intelligent (2-3 jours)
- [ ] Créer `hint-system.js`
- [ ] Créer `smart-validator.js`
- [ ] Créer `error-detector.js`
- [ ] Implémenter les niveaux de guidage

### Phase 3 : Interface Frontend (3-4 jours)
- [ ] Créer/mettre à jour `Coach.jsx`
- [ ] Composant `CaptureZone`
- [ ] Composant `InteractiveWorkspace`
- [ ] Composant `HintPanel`
- [ ] Composant `ProgressBar`

### Phase 4 : Intégration & Tests (2-3 jours)
- [ ] Tester tous les flux
- [ ] Ajuster les prompts Gemini
- [ ] Optimiser les performances
- [ ] Tests utilisateurs

---

## 📝 Notes Importantes

1. **Ne jamais donner la solution** - Toujours guider
2. **Adaptation continue** - Le guidage doit s'adapter en temps réel
3. **Encouragement constant** - Même en cas d'erreur
4. **Apprentissage progressif** - Construire sur ce que l'élève sait
5. **Feedback constructif** - Expliquer pourquoi, pas seulement quoi

---

## 🔗 Références

- Service coach actuel : `backend/src/modules/coach/`
- Documentation Gemini API : https://ai.google.dev/docs
- Pédagogie Socratique : Guide l'élève vers la découverte


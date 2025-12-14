# 📚 PLAN D'INTÉGRATION : 1800 QUESTIONS (QCM + EXERCICES)

## 🎯 OBJECTIF

Ajouter **1800 questions** à la plateforme Koundoul :
- **100 QCM** par matière/niveau (3 matières × 3 niveaux × 100 = 900)
- **100 Exercices** par matière/niveau (3 matières × 3 niveaux × 100 = 900)
- **Total : 1800 questions**

---

## 📊 STRUCTURE DES DONNÉES

### Format QCM
```json
{
  "bank_info": {
    "title": "Banque QCM - Mathématiques Seconde",
    "level": "Seconde",
    "subject": "Mathématiques",
    "type": "QCM"
  },
  "questions": [
    {
      "id": "M2-QCM-001",
      "chapter": "Nombres & Calculs",
      "difficulty": 1,
      "points": 5,
      "time_limit_seconds": 45,
      "question": "À quel ensemble appartient le nombre √2 ?",
      "options": [
        {"id": "A", "text": "ℕ", "is_correct": false},
        {"id": "B", "text": "ℤ", "is_correct": false},
        {"id": "C", "text": "ℚ", "is_correct": false},
        {"id": "D", "text": "ℝ \\ ℚ", "is_correct": true}
      ],
      "explanation": "√2 est un nombre irrationnel...",
      "related_lesson": "M2-01"
    }
  ]
}
```

### Format Exercices
```json
{
  "bank_info": {
    "title": "Banque Exercices - Mathématiques Seconde",
    "level": "Seconde",
    "subject": "Mathématiques",
    "type": "Exercices"
  },
  "exercises": [
    {
      "id": "M2-EX-001",
      "chapter": "Nombres & Calculs",
      "difficulty": 1,
      "points": 10,
      "time_limit_minutes": 5,
      "problem": "Calculer : 3/4 + 5/6",
      "solution": {
        "steps": ["...", "..."],
        "final_answer": "19/12"
      },
      "hints": ["...", "..."],
      "related_lesson": "M2-06"
    }
  ]
}
```

---

## 🗂️ ORGANISATION DES FICHIERS

```
data/question-banks/
├── m2-qcm-seconde.json      (✅ à créer - 100 QCM)
├── m2-ex-seconde.json       (✅ à créer - 100 Exercices)
├── m1-qcm-premiere.json     (⏳ à fournir)
├── m1-ex-premiere.json      (⏳ à fournir)
├── mt-qcm-terminale.json    (⏳ à fournir)
├── mt-ex-terminale.json     (⏳ à fournir)
├── p2-qcm-seconde.json      (⏳ à fournir)
├── p2-ex-seconde.json       (⏳ à fournir)
├── p1-qcm-premiere.json     (⏳ à fournir)
├── p1-ex-premiere.json      (⏳ à fournir)
├── pt-qcm-terminale.json    (⏳ à fournir)
├── pt-ex-terminale.json     (⏳ à fournir)
├── c2-qcm-seconde.json      (⏳ à fournir)
├── c2-ex-seconde.json       (⏳ à fournir)
├── c1-qcm-premiere.json     (⏳ à fournir)
├── c1-ex-premiere.json      (⏳ à fournir)
├── ct-qcm-terminale.json    (⏳ à fournir)
└── ct-ex-terminale.json     (⏳ à fournir)
```

**18 fichiers JSON au total**

---

## 🏗️ ARCHITECTURE SUPABASE

### Table `question_banks`
```sql
CREATE TABLE public.question_banks (
  id VARCHAR(20) PRIMARY KEY,  -- M2-QCM, M2-EX, etc.
  title VARCHAR(200),
  level VARCHAR(20),           -- Seconde, Première, Terminale
  subject VARCHAR(50),         -- Mathématiques, Physique, Chimie
  type VARCHAR(20),            -- QCM, Exercices
  total_questions INTEGER,
  chapters_covered JSONB,
  difficulty_distribution JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table `qcm_questions`
```sql
CREATE TABLE public.qcm_questions (
  id VARCHAR(20) PRIMARY KEY,     -- M2-QCM-001
  bank_id VARCHAR(20) REFERENCES public.question_banks(id),
  chapter VARCHAR(100),
  difficulty INTEGER,
  points INTEGER,
  time_limit_seconds INTEGER,
  question TEXT,
  options JSONB,                  -- [{id: "A", text: "...", is_correct: true}]
  explanation TEXT,
  related_lesson VARCHAR(10),
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table `exercise_problems`
```sql
CREATE TABLE public.exercise_problems (
  id VARCHAR(20) PRIMARY KEY,     -- M2-EX-001
  bank_id VARCHAR(20) REFERENCES public.question_banks(id),
  chapter VARCHAR(100),
  difficulty INTEGER,
  points INTEGER,
  time_limit_minutes INTEGER,
  problem TEXT,
  solution JSONB,                 -- {steps: [...], final_answer: "..."}
  hints JSONB,                    -- [...]
  related_lesson VARCHAR(10),
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 ÉTAPES D'IMPLÉMENTATION

### **Étape 1 : Structure Base de Données** ✅
- [x] Créer `data/question-banks/`
- [x] Créer le plan d'intégration
- [ ] Créer les tables Supabase (migration SQL)
- [ ] Ajouter RLS policies
- [ ] Créer les index

### **Étape 2 : Sauvegarde des Données** ⏳
- [ ] Sauvegarder M2-QCM Seconde (100 QCM) 
- [ ] Sauvegarder M2-EX Seconde (100 Exercices)
- [ ] Attendre les autres lots de l'utilisateur

### **Étape 3 : Script d'Import** 🔨
- [ ] Créer `scripts/import_question_banks.js`
- [ ] Parser les fichiers JSON
- [ ] Insérer dans Supabase
- [ ] Tester avec M2 seulement

### **Étape 4 : API Backend** 🔌
- [ ] Route `GET /api/question-banks` (liste)
- [ ] Route `GET /api/question-banks/:id` (détail)
- [ ] Route `GET /api/qcm/:bankId/random?n=10` (QCM aléatoires)
- [ ] Route `GET /api/exercises/:bankId/random?n=5` (Exercices aléatoires)

### **Étape 5 : Frontend** 🎨
- [ ] Page `/question-banks` (liste)
- [ ] Page `/question-banks/qcm/:bankId` (jouer QCM)
- [ ] Page `/question-banks/exercises/:bankId` (faire exercices)
- [ ] Affichage scores et progression

---

## 🚀 POUR DÉMARRER

Vous avez fourni les **2 premiers lots** (100 QCM + 100 Exercices Math Seconde).

**Actions immédiates :**
1. ✅ Créer `data/question-banks/`
2. ⏳ Sauvegarder les 2 fichiers JSON
3. 🔨 Créer les tables Supabase
4. 🔨 Créer le script d'import
5. 🧪 Tester l'import avec les 200 premières questions

**Ensuite, fournissez les 16 autres lots** (1600 questions restantes).

---

## 📈 PROGRESSION

| Matière | Niveau | QCM | Exercices | Statut |
|---------|--------|-----|-----------|--------|
| **Mathématiques** | Seconde | 100 | 100 | ⏳ **À fournir** |
| **Mathématiques** | Première | 100 | 100 | ⏳ À fournir |
| **Mathématiques** | Terminale | 100 | 100 | ⏳ À fournir |
| **Physique** | Seconde | 100 | 100 | ⏳ À fournir |
| **Physique** | Première | 100 | 100 | ⏳ À fournir |
| **Physique** | Terminale | 100 | 100 | ⏳ À fournir |
| **Chimie** | Seconde | 100 | 100 | ⏳ À fournir |
| **Chimie** | Première | 100 | 100 | ⏳ À fournir |
| **Chimie** | Terminale | 100 | 100 | ⏳ À fournir |

**Total :** 900 QCM + 900 Exercices = **1800 questions**

---

## ❓ QUESTIONS

1. **Où fournir les 16 autres lots ?**
   → Dans le chat, je vais créer les fichiers automatiquement

2. **Format des solutions des exercices ?**
   → Acceptée avec `steps` et `final_answer` ✅

3. **Comment lier aux micro-leçons existantes ?**
   → Via le champ `related_lesson` (ex: "M2-01")

4. **Performance avec 1800 questions ?**
   → Index sur bank_id, chapter, difficulty + pagination

5. **Gamification ?**
   → XP basé sur points, badges par chapitre, classements

---

## 🎉 RÉSUMÉ

Vous avez fourni le **premier lot** (200 questions Math Seconde).

**Prochaine étape :** Je sauvegarde ces 200 questions et crée les tables Supabase, puis vous demandez les lots suivants.

**C'est parti ! 🚀**










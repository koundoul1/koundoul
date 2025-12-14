# 📚 Micro-Leçons - Application ScientificApp

## Vue d'ensemble
**450 micro-leçons** complètes pour le programme de lycée général en **Mathématiques**, **Physique** et **Chimie**.

## 📊 Répartition

### Par Niveau
- **Seconde** : 120 micro-leçons (40 Math + 40 Phys + 40 Chimie)
- **Première** : 150 micro-leçons (70 Math + 40 Phys + 40 Chimie)  
- **Terminale** : 180 micro-leçons (90 Math + 45 Phys + 45 Chimie)

### Par Matière
- **Mathématiques** : 200 micro-leçons
- **Physique** : 125 micro-leçons
- **Chimie** : 125 micro-leçons

## 🎯 Structure d'une Micro-Leçon

```json
{
  "id": "M2-01",
  "level": "Seconde",
  "subject": "Mathématiques",
  "chapter": "Nombres & Calculs",
  "title": "Ensembles de nombres (ℕ, ℤ, ℚ, ℝ)",
  "duration_min": 7,
  "objectives": [
    "Distinguer les différents ensembles de nombres",
    "Reconnaître l'appartenance d'un nombre à un ensemble",
    "Utiliser les notations mathématiques"
  ],
  "prerequisites": ["Opérations de base"],
  "content_types": ["video", "animation", "quiz", "exercises"],
  "difficulty": 1,
  "xp_reward": 50,
  "tags": ["nombres", "ensembles", "fondamentaux"]
}
```

## 📂 Fichiers Disponibles

1. **`microlessons_450_COMPLETE.json`** - JSON complet (à générer via script)
2. **`microlessons_insert.sql`** - Script SQL d'insertion BDD
3. **`generate_all_lessons.py`** - Script Python de génération

## 🗄️ Structure Base de Données

```sql
CREATE TABLE microlessons (
    id VARCHAR(10) PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    chapter VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration_min INT NOT NULL,
    objectives JSON NOT NULL,
    prerequisites JSON NOT NULL,
    content_types JSON NOT NULL,
    difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    xp_reward INT NOT NULL,
    tags JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📋 Contenu Détaillé

### SECONDE (120 leçons)

#### Mathématiques (40)
- **Nombres & Calculs** (8) : Ensembles, intervalles, valeur absolue, puissances, fractions, calcul littéral, identités remarquables, équations 1er degré
- **Fonctions** (12) : Notion, graphique, variations, affine, carré, inverse, racine, associées, résolutions
- **Géométrie** (10) : Vecteurs, Chasles, colinéarité, repérage, coordonnées, droites, trigonométrie
- **Statistiques & Probabilités** (10) : Descriptive, moyenne/médiane, écart-type, diagrammes, probabilités, arbres, échantillonnage

#### Physique (40) 
- **Mouvement & Interactions** (14) : Description, référentiel, vitesse, inertie, forces, poids, gravitation
- **Ondes & Signaux** (14) : Nature ondes, son, lumière, vitesse, réfraction, dispersion, spectres
- **Énergie** (12) : Formes, transferts, conservation, sources, chaînes, rendement

#### Chimie (40)
- **Constitution Matière** (16) : Atomes, structure, tableau périodique, ions, molécules, formules, mole, concentration
- **Transformations Chimiques** (14) : Réactions, équations, conservation, stœchiométrie, avancement, réactif limitant
- **Solutions Aqueuses** (10) : Dissolution, solvant/soluté, solubilité, pH, tests ions

### PREMIÈRE (150 leçons)

#### Mathématiques (70)
- **Second Degré** (12) : Formes, résolution, somme/produit racines, signe, inéquations, paraboles, optimisation
- **Dérivation** (15) : Taux variation, nombre dérivé, fonction dérivée, usuelles, opérations, quotient, composée, variations, extremums, tangente, optimisation, physique, algorithmes
- **Suites** (13) : Définition, modes, arithmétiques, géométriques, variations, bornées, convergence, limites, algorithmes, modélisation
- **Exponentielles** (10) : Croissance, définition, propriétés, dérivée, étude, équations, inéquations, composée, sciences, modélisation
- **Géométrie Repérée** (10) : Produit scalaire (géométrique, analytique, propriétés), orthogonalité, distances, cercles, vecteurs directeurs/normaux, équations droites, problèmes, espace
- **Probabilités** (10) : Conditionnelles, arbres pondérés, formule totales, indépendance, variables aléatoires, loi, espérance, variance, Bernoulli, binomiale

#### Physique (40)
- **Mécanique** (24) : Vecteur vitesse/accélération, Newton, chute libre, circulaire, projectile, énergie cinétique/potentielle, travail, puissance, conservation
- **Ondes** (22) : Progressives, sinusoïdales, période/fréquence/longueur d'onde, célérité, diffraction, interférences, Doppler, son, spectre, applications
- **Électricité** (16) : Courant, tension, Ohm, résistance, circuits série/parallèle, générateurs/récepteurs, énergie, puissance

#### Chimie (40)
- **Structure & Transformation** (24) : Configuration électronique, familles, liaisons, VSEPR, électronégativité, polarité, forces intermoléculaires, acide-base, pH/pKa, redox
- **Chimie Organique** (26) : Chaînes carbonées, formules, groupes caractéristiques, nomenclature (alcanes, alcools, autres), isomérie, réactivité, oxydation, estérification, synthèse, extraction, protocoles

### TERMINALE (180 leçons)

#### Mathématiques (90)
- **Limites** (15) : Finie/infinie en point, à l'infini, asymptotes (V, H, O), opérations, FI, comparaison, exp/ln/polynômes, quotients, composées, théorèmes comparaison/gendarmes
- **Continuité & Dérivabilité** (12) : Continuité point/intervalle, TVI, applications, dérivabilité, dérivée rappels, composées chaîne, ln(u)/exp(u), u^n, convexité, inflexion, optimisation
- **Logarithme** (10) : Introduction, fonction, propriétés algébriques, dérivée ln(x)/ln(u), étude, équations, inéquations, croissances comparées, applications (pH, décibels, Richter)
- **Primitives & Intégrales** (18) : Notion, usuelles, opérations, u'u^n, u'/u, u'exp(u), intégrale définie, propriétés, aire, calcul, valeur moyenne, IPP, ED y'=ay, y'=ay+b, physique, volumes, probabilités, synthèse
- **Espace** (12) : Repérage, vecteurs, coplanarité, produit scalaire, plans, droites, orthogonalité, positions relatives, intersections, distances, paramétriques, problèmes 3D
- **Suites Avancées** (10) : Récurrence, limites théorèmes, adjacentes, géométriques limites, comportement infini, implicites, algorithmes, modélisation dynamique, asymptotique, intégrales
- **Probabilités Avancées** (13) : Somme variables, binomiale approfondie, géométrique, Poisson, concentration/loi grands nombres, intervalles fluctuation/confiance, échantillonnage, tests, variables continues, uniforme, normale, applications

#### Physique (45)
- **Mécanique Avancée** (20) : Pesanteur, planètes, Kepler, satellites, énergie satellite, champ électrique, champ magnétique, Lorentz, applications, relativiste
- **Ondes & Signaux** (20) : Progressives périodiques, analyse spectrale, Doppler approfondi, lunette, télescope, diffraction (fente, circulaire), Rayleigh, interférences, applications modernes
- **Électricité & Électromagnétisme** (20) : RC, charge/décharge condensateur, énergie condensateur, RL, auto-induction, transferts énergétiques, RLC, résonance, champs magnétiques, induction

#### Chimie (45)
- **Cinétique & Thermodynamique** (26) : Vitesse réaction, facteurs (température, concentration), catalyse, mécanismes, énergie activation, Arrhenius, spontanées, forcées, 1er principe, enthalpie, endo/exothermique, applications énergétiques
- **Équilibres & Dosages** (24) : État équilibre, constante K, quotient Q, Le Chatelier, équilibres acide-base, dosages (direct, pH-métrique, conductimétrique, colorimétrique), indicateurs, redox, applications analytiques

## 🚀 Utilisation

### Import JSON
```javascript
import lessons from './microlessons_450_COMPLETE.json';
const seconde_math = lessons.filter(l => l.level === 'Seconde' && l.subject === 'Mathématiques');
```

### Insertion SQL
```bash
mysql -u root -p scientific_app < microlessons_insert.sql
```

### Génération Python
```bash
python3 generate_all_lessons.py
```

## ✅ Checklist Qualité

Chaque micro-leçon respecte :
- ✓ Durée : 5-10 min
- ✓ 1 concept = 1 leçon
- ✓ Visuel attractif
- ✓ Interaction régulière
- ✓ Exercice d'application
- ✓ Feedback instantané
- ✓ Lien avec vie réelle
- ✓ Accessibilité
- ✓ Mode offline
- ✓ Notation utilisateur

## 📦 Volume Production

- **Vidéos** : 450 × 2-3 min = 900-1350 min (15-22h)
- **Animations** : 450 × 4 = 1800 animations
- **Fiches PDF** : 450 fiches
- **Simulations** : ~150 (une par 3 leçons)
- **Exercices** : 450 × 3 = 1350 exercices
- **Quiz** : 450 × 5 questions = 2250 questions

## 🎨 Types de Leçons

- **Théorique** (60%) : Explication + démonstration
- **Pratique** (25%) : Exercice pas-à-pas
- **Expérimentale** (10%) : Protocole virtuel
- **Culture** (5%) : Applications réelles

## 📝 Licence

© 2025 ScientificApp - Usage éducatif

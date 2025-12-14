# 📦 Assets à créer pour la micro-leçon : Dérivée de la fonction exponentielle

## 1. Images statiques

### 1.1 Graphique de la fonction exp(x)
**Fichier :** `graphic-exp-function.png` (800x600px)
**Description :** 
- Courbe de exp(x) en bleu sur fond gris clair
- Axes avec graduations (x: -2 à 2, y: 0 à 8)
- Point (0, 1) marqué en rouge
- Tangentes en 3 points (x = -1, 0, 1)
- Annotations pour les pentes

### 1.2 Diagramme de dérivation
**Fichier :** `diagram-chain-rule.png` (600x400px)
**Description :**
- Visualisation de la règle de la chaîne
- Schéma : u(x) → exp(u) → u' × exp(u)
- Flèches colorées pour montrer le processus

### 1.3 Formules principales
**Fichier :** `formulas-summary.png` (800x600px)
**Description :**
- Tableau avec toutes les formules de dérivation
- Style LaTeX/math
- Fond blanc, cadre coloré

## 2. Animations

### 2.1 Animation de la dérivée
**Fichier :** `animation-derivative.gif` ou `.mp4`
**Durée :** 15 secondes
**Description :**
- Montre la courbe de exp(x)
- Trace la tangente qui se déplace le long de la courbe
- Affichage en temps réel de la pente de la tangente
- Montre que pente = valeur de exp au point

### 2.2 Animation croissance bactérienne
**Fichier :** `animation-bacterial-growth.gif` (20 secondes)
**Description :**
- Graphique de N(t) = 1000exp(0.2t)
- Point qui se déplace sur la courbe
- Affichage de la dérivée instantanée (taux de croissance)
- Lien visuel entre dérivée et vitesse de croissance

### 2.3 Animation interactive de dérivation
**Fichier :** React Component - `GraphiqueExp.jsx`
**Description :**
- Graphique interactif avec slider pour x
- Affichage dynamique de f(x) et f'(x)
- Comparaison visuelle

## 3. Composants React interactifs

### 3.1 GraphiqueExp.jsx
**Fonctionnalités :**
- Graphique de exp(x) dessiné avec react-chartjs-2 ou plotly
- Slider pour choisir un point x₀
- Affichage de la tangente à ce point
- Affichage simultané de f(x₀) et f'(x₀) avec égalité
- Animation optionnelle

### 3.2 DerivativeCalculator.jsx
**Fonctionnalités :**
- Champ de saisie pour entrer exp(...)
- Calcul automatique de la dérivée
- Affichage étape par étape du calcul
- Exemples pré-remplis (boutons)

### 3.3 AnimationGrowth.jsx
**Fonctionnalités :**
- Simulation de croissance d'une population
- Paramètres ajustables (taux, population initiale)
- Affichage de la dérivée en temps réel
- Graphique évolutif

## 4. Audio et vidéos

### 4.1 Explication audio
**Fichier :** `audio-explanation.mp3` (5 minutes)
**Contenu :**
- Explication voix off des concepts clés
- Références temporelles pour synchronisation avec animations
- Version française avec articulation claire

### 4.2 Vidéo tutorielle (optionnel)
**Fichier :** `video-tutorial.mp4` (8 minutes)
**Contenu :**
- Screen capture de la dérivation étape par étape
- Voix off expliquant le raisonnement
- Exemples concrets montrés graphiquement

## 5. Documents PDF

### 5.1 Fiche mémo
**Fichier :** `fiche-memo-derivee-expo.pdf`
**Contenu :**
- Toutes les formules dans un tableau compact
- Exemples typiques
- Erreurs à éviter en rouge
- Applications concrètes
- Page A4 recto-verso

### 5.2 Exercices supplémentaires
**Fichier :** `exercices-complementaires-derivee-expo.pdf`
**Contenu :**
- 10 exercices progressifs
- Solutions détaillées
- Espace pour noter les réponses

## 6. Données et JSON

### 6.1 Graphiques de données
**Fichier :** `growth-data.json`
**Contenu :**
```json
{
  "bacterial-growth": {
    "time": [0, 1, 2, 3, 4, 5],
    "population": [1000, 1221, 1492, 1822, 2225, 2718],
    "growth-rate": [200, 244, 298, 364, 445, 544]
  },
  "investment-growth": {
    "time": [0, 5, 10, 15, 20],
    "value": [1000, 1284, 1649, 2117, 2718],
    "rate": [50, 64, 82, 106, 136]
  }
}
```

## 7. Icônes et visuels

### 7.1 Icône de chapitre
**Fichier :** `icon-exponential.svg` (64x64px)
**Description :** Courbe exponentielle stylisée dans un cercle

### 7.2 Émojis et badges
- 📈 Courbe croissante
- 🔢 Calcul
- ⚡ Croissance
- 🎯 Objectif
- ✅ Validation

## Liste de priorité

### 🔴 Priorité haute (à créer immédiatement)
1. ✅ Graphique de exp(x) (image statique)
2. ✅ Formulaire de dérivation (tableau)
3. ✅ Composant React GraphiqueExp

### 🟡 Priorité moyenne (à créer ensuite)
4. ⏳ Animation dérivée (GIF/MP4)
5. ⏳ Fiche mémo PDF
6. ⏳ Composant DerivativeCalculator

### 🟢 Priorité basse (améliorations futures)
7. ⏳ Vidéo tutorielle complète
8. ⏳ Audio explicatif
9. ⏳ Animation croissance bactérienne

## Outils recommandés

### Pour les graphiques
- **Desmos** : Graphiques mathématiques
- **GeoGebra** : Géométrie et calcul
- **Python (Matplotlib)** : Graphiques programmables
- **React-ChartJS-2** : Graphiques interactifs

### Pour les animations
- **Manim** : Animations mathématiques Python
- **After Effects** : Animations avancées
- **GIPHY** : Conversion en GIF
- **React Spring** : Animations React

### Pour les PDF
- **LaTeX** : Documents mathématiques
- **Canva** : Design moderne
- **Notion** : Export PDF facile

## Emplacement des fichiers

```
frontend/public/
├── images/
│   ├── lessons/
│   │   ├── graphic-exp-function.png
│   │   ├── diagram-chain-rule.png
│   │   └── formulas-summary.png
│   └── icons/
│       └── icon-exponential.svg
├── videos/
│   └── animation-derivative.mp4
└── documents/
    └── fiche-memo-derivee-expo.pdf

frontend/src/components/lessons/
├── GraphiqueExp.jsx
├── DerivativeCalculator.jsx
└── AnimationGrowth.jsx

frontend/src/data/
└── growth-data.json
```

## Notes pour les créateurs

- **Cohérence visuelle :** Utiliser la palette de couleurs Koundoul (voir `koundoul-dark-theme.css`)
- **Accessibilité :** Ajouter des descriptions alt pour toutes les images
- **Performance :** Optimiser les images (WebP pour web, comprimer les vidéos)
- **Responsive :** Tester sur mobile et tablette
- **Multilingue :** Préparer les assets pour traduction (éviter le texte dans les images)



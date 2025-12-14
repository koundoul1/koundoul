# 📋 FICHE MÉMO : Dérivée de la Fonction Exponentielle

---

## 🎯 FORMULES PRINCIPALES

### Formule de base
```
d/dx [exp(x)] = exp(x)
ou
(eˣ)' = eˣ
```
**C'est la seule fonction dont la dérivée est égale à elle-même !**

---

### Formule pour fonction composée
```
d/dx [exp(u(x))] = u'(x) × exp(u(x))
```

**Règle mnémotechnique :**
- Dériver l'exponentielle → reste exp(u)
- Multiplier par la dérivée interne → u'

---

## 📊 EXEMPLES TYPIQUES

| Fonction f(x) | Dérivée f'(x) |
|--------------|---------------|
| exp(x) | exp(x) |
| exp(5x) | 5 × exp(5x) |
| exp(x²) | 2x × exp(x²) |
| exp(2x + 3) | 2 × exp(2x + 3) |
| 3exp(4x) | 12 × exp(4x) |
| exp(-x) | -exp(-x) |

---

## ✅ MÉTHODE PAS À PAS

Pour dériver **exp(u(x))** :

1. **Identifier** u(x) et calculer u'(x)
2. **Appliquer** : f'(x) = u'(x) × exp(u(x))
3. **Simplifier** si possible

**Exemple :** f(x) = exp(3x² + 1)

**Résolution :**
1. u(x) = 3x² + 1
2. u'(x) = 6x
3. f'(x) = 6x × exp(3x² + 1)

---

## ⚠️ ERREURS COURANTES

### ❌ Oubli de la dérivée interne
```
FAUX : [exp(5x)]' = exp(5x)
✓     : [exp(5x)]' = 5exp(5x)
```

### ❌ Confondre exp(x²) et [exp(x)]²
```
FAUX : [exp(x)]² = exp(x²)
✓     : [exp(x)]² = exp(2x)
```

### ❌ Utiliser la règle des puissances
```
FAUX : [exp(x)]' = x × exp(x)^(x-1)
✓     : [exp(x)]' = exp(x)
```

---

## 🧮 APPLICATIONS CONCRÈTES

### Croissance exponentielle
Population : N(t) = N₀ × exp(rt)
- Taux de croissance : N'(t) = N₀ × r × exp(rt)
- Interprétation : vitesse de croissance

### Intérêts composés continus
Valeur : V(t) = V₀ × exp(rt)
- Taux de variation : V'(t) = V₀ × r × exp(rt)

### Décroissance radioactive
Masse : m(t) = m₀ × exp(-λt)
- Taux de décroissance : m'(t) = -m₀ × λ × exp(-λt)

---

## 📝 EXERCICE-TYPE

**Énoncé :** Dérive f(x) = 4exp(2x² - x + 1)

**Solution étape par étape :**

```
Étape 1 : Identifier u(x)
u(x) = 2x² - x + 1
u'(x) = 4x - 1

Étape 2 : Appliquer la formule
f'(x) = 4 × u'(x) × exp(u(x))
f'(x) = 4 × (4x - 1) × exp(2x² - x + 1)

Étape 3 : Simplifier
f'(x) = 4(4x - 1)exp(2x² - x + 1)
```

**✓ Réponse finale :** f'(x) = 4(4x - 1)exp(2x² - x + 1)

---

## 🎓 RECOMMANDATIONS

✅ **À FAIRE :**
- Toujours identifier u(x) avant de dériver
- Multiplier par u'(x)
- Simplifier au maximum
- Vérifier en dérivant mentalement

❌ **À ÉVITER :**
- Oublier la dérivée interne
- Confondre exp(x²) et exp(x)²
- Appliquer la règle des puissances sur exp

---

## 🔗 LIENS AVEC D'AUTRES CHAPITRES

- **Fonctions composées :** Même principe pour sin(u(x)), ln(u(x))
- **Limites :** Fondamental pour définir exp(x)
- **Intégration :** ∫exp(x)dx = exp(x) + C (réciproque !)
- **Équations différentielles :** y' = y a pour solution y = Cexp(x)

---

## 📞 AIDE

**Si tu bloques :**
1. Réécris exp(u(x)) explicitement
2. Identifie u(x) et u'(x)
3. Applique : u' × exp(u)
4. Vérifie avec un exemple simple

**Exemple simple pour vérifier :**
- exp(x)' = exp(x) ✓
- exp(2x)' = 2exp(2x) ✓

---

*Version 1.0 - Micro-leçon Koundoul*
*Pour révision et examen*



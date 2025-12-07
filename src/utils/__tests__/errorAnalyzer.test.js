import { analyzeStudentAttempt, errorPatterns, generateRecommendations, assessConfidenceLevel } from '../errorAnalyzer'

describe('Error Analyzer - Math', () => {
  describe('Sign Errors', () => {
    test('détecte une erreur de signe simple', () => {
      const attempt = 'x = -4'
      const correct = 'x = 4'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].type).toBe('Erreur de signe')
      expect(errors[0].icon).toBe('➕➖')
    })
    
    test('ne détecte pas d\'erreur si correct', () => {
      const attempt = 'x = 4'
      const correct = 'x = 4'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      expect(errors).toHaveLength(0)
    })
    
    test('détecte erreur de signe avec plusieurs nombres', () => {
      const attempt = 'x = -4, y = 3'
      const correct = 'x = 4, y = 3'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].type).toBe('Erreur de signe')
    })
  })
  
  describe('Order of Operations', () => {
    test('détecte erreur ordre des opérations', () => {
      const attempt = '2 + 3 * 4 = 20'
      const correct = '2 + 3 * 4 = 14'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      const orderError = errors.find(e => e.type === 'Ordre des opérations')
      expect(orderError).toBeDefined()
      expect(orderError.icon).toBe('🔢')
    })
    
    test('accepte ordre correct', () => {
      const attempt = '2 + 12 = 14'
      const correct = '2 + 12 = 14'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      const orderError = errors.find(e => e.type === 'Ordre des opérations')
      expect(orderError).toBeUndefined()
    })
  })
  
  describe('Fraction Errors', () => {
    test('détecte fraction non simplifiée', () => {
      const attempt = '4/6'
      const correct = '2/3'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      const fractionError = errors.find(e => e.type === 'Fraction non simplifiée')
      expect(fractionError).toBeDefined()
      expect(fractionError.icon).toBe('🔢')
    })
    
    test('accepte fraction simplifiée', () => {
      const attempt = '2/3'
      const correct = '2/3'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      const fractionError = errors.find(e => e.type === 'Fraction non simplifiée')
      expect(fractionError).toBeUndefined()
    })
  })
  
  describe('Division by Zero', () => {
    test('détecte division par zéro', () => {
      const attempt = 'x/0 = 5'
      const correct = 'x = 5'
      const errors = analyzeStudentAttempt(attempt, correct, 'math')
      
      const divError = errors.find(e => e.type === 'Division par zéro')
      expect(divError).toBeDefined()
      expect(divError.icon).toBe('⚠️')
    })
  })
})

describe('Error Analyzer - Physics', () => {
  describe('Unit Errors', () => {
    test('détecte unité manquante', () => {
      const attempt = '15'
      const correct = '15 m/s'
      const errors = analyzeStudentAttempt(attempt, correct, 'physics')
      
      const unitError = errors.find(e => e.type === 'Unité manquante')
      expect(unitError).toBeDefined()
      expect(unitError.icon).toBe('📏')
    })
    
    test('accepte si unité présente', () => {
      const attempt = '15 m/s'
      const correct = '15 m/s'
      const errors = analyzeStudentAttempt(attempt, correct, 'physics')
      
      const unitError = errors.find(e => e.type === 'Unité manquante')
      expect(unitError).toBeUndefined()
    })
  })
  
  describe('Conversion Errors', () => {
    test('détecte erreur de conversion', () => {
      const attempt = '1 km = 100 m'
      const correct = '1 km = 1000 m'
      const errors = analyzeStudentAttempt(attempt, correct, 'physics')
      
      const convError = errors.find(e => e.type === 'Erreur de conversion')
      expect(convError).toBeDefined()
      expect(convError.icon).toBe('↔️')
    })
  })
  
  describe('Vector Errors', () => {
    test('détecte notation vectorielle manquante', () => {
      const attempt = 'La force est F = 10 N'
      const correct = 'La force est F⃗ = 10 N'
      const errors = analyzeStudentAttempt(attempt, correct, 'physics')
      
      const vectorError = errors.find(e => e.type === 'Notation vectorielle manquante')
      expect(vectorError).toBeDefined()
      expect(vectorError.icon).toBe('➡️')
    })
  })
})

describe('Error Patterns Structure', () => {
  test('tous les patterns ont les propriétés requises', () => {
    Object.values(errorPatterns).forEach(subject => {
      Object.values(subject).forEach(pattern => {
        expect(pattern).toHaveProperty('check')
        expect(pattern).toHaveProperty('error')
        expect(pattern.error).toHaveProperty('type')
        expect(pattern.error).toHaveProperty('icon')
        expect(pattern.error).toHaveProperty('explanation')
        expect(pattern.error).toHaveProperty('correction')
        expect(pattern.error).toHaveProperty('example')
      })
    })
  })
  
  test('tous les patterns ont des URLs de ressources', () => {
    Object.values(errorPatterns).forEach(subject => {
      Object.values(subject).forEach(pattern => {
        expect(pattern.error).toHaveProperty('videoUrl')
        expect(pattern.error).toHaveProperty('exerciceUrl')
      })
    })
  })
})

describe('Generate Recommendations', () => {
  test('génère recommandations pour erreurs fréquentes', () => {
    const errorHistory = [
      { type: 'Erreur de signe', timestamp: '2025-01-01' },
      { type: 'Erreur de signe', timestamp: '2025-01-02' },
      { type: 'Erreur de signe', timestamp: '2025-01-03' },
      { type: 'Ordre des opérations', timestamp: '2025-01-04' }
    ]
    
    const recommendations = generateRecommendations(errorHistory)
    
    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations[0].type).toBe('Erreur de signe')
    expect(recommendations[0].count).toBe(3)
    expect(recommendations[0].priority).toBe('high')
  })
  
  test('ne génère pas de recommandations si < 3 erreurs', () => {
    const errorHistory = [
      { type: 'Erreur de signe', timestamp: '2025-01-01' },
      { type: 'Erreur de signe', timestamp: '2025-01-02' }
    ]
    
    const recommendations = generateRecommendations(errorHistory)
    
    expect(recommendations).toHaveLength(0)
  })
})

describe('Assess Confidence Level', () => {
  test('détecte niveau de confiance élevé', () => {
    const attempt = `1. Je pose l'équation: x + 5 = 12
2. Je soustrais 5 des deux côtés: x = 12 - 5
3. Je calcule: x = 7
4. Vérification: 7 + 5 = 12 ✓
Donc la solution est x = 7`
    
    const confidence = assessConfidenceLevel(attempt)
    
    expect(confidence.level).toBe('high')
    expect(confidence.label).toBe('Confiant')
    expect(confidence.color).toBe('green')
  })
  
  test('détecte niveau de confiance faible', () => {
    const attempt = 'x = 7'
    
    const confidence = assessConfidenceLevel(attempt)
    
    expect(confidence.level).toBe('low')
    expect(confidence.label).toBe('Hésitant')
    expect(confidence.color).toBe('red')
  })
  
  test('détecte niveau de confiance moyen', () => {
    const attempt = `x + 5 = 12
x = 12 - 5
x = 7`
    
    const confidence = assessConfidenceLevel(attempt)
    
    expect(confidence.level).toBe('medium')
    expect(confidence.label).toBe('Modéré')
    expect(confidence.color).toBe('yellow')
  })
})






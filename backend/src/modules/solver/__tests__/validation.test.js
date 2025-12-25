import { validateDomain, validateInput } from '../prompts/validation.js'

describe('Domain Validation', () => {
  describe('Domaines autorisés', () => {
    test('accepte problème de mathématiques', () => {
      const result = validateDomain(
        'Résoudre l\'équation x² + 2x + 1 = 0',
        'math'
      )
      expect(result.isValid).toBe(true)
    })
    
    test('accepte problème de physique', () => {
      const result = validateDomain(
        'Calculer la force avec masse 5kg et accélération 2m/s²',
        'physics'
      )
      expect(result.isValid).toBe(true)
    })
    
    test('accepte problème de chimie', () => {
      const result = validateDomain(
        'Équilibrer la réaction: H2 + O2 → H2O',
        'chemistry'
      )
      expect(result.isValid).toBe(true)
    })
  })
  
  describe('Détection hors-cadre (CRITIQUE)', () => {
    test('refuse question de sport', () => {
      const result = validateDomain(
        'Qui a gagné la dernière coupe du monde de football?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
      expect(result.message).toContain('Mathématiques, Physique et Chimie')
    })
    
    test('refuse question d\'histoire', () => {
      const result = validateDomain(
        'Qui était le roi de France en 1789?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
    })
    
    test('refuse question personnelle', () => {
      const result = validateDomain(
        'Comment gérer mes émotions?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
    })
    
    test('refuse question de biologie', () => {
      const result = validateDomain(
        'Qu\'est-ce qu\'une cellule eucaryote?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
    })
    
    test('refuse question de littérature', () => {
      const result = validateDomain(
        'Qui a écrit Les Misérables?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
    })
    
    test('refuse question de géographie', () => {
      const result = validateDomain(
        'Quelle est la capitale de la France?',
        'general'
      )
      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('out_of_scope')
    })
  })
  
  describe('Auto-détection de domaine', () => {
    test('détecte automatiquement le domaine physique', () => {
      const result = validateDomain(
        'Calculer la force avec masse et accélération',
        'general'
      )
      expect(result.isValid).toBe(true)
      expect(result.suggestedDomain).toBe('physics')
    })
    
    test('détecte automatiquement le domaine math', () => {
      const result = validateDomain(
        'Calculer la dérivée de la fonction x³',
        'general'
      )
      expect(result.isValid).toBe(true)
      expect(result.suggestedDomain).toBe('math')
    })
    
    test('détecte automatiquement le domaine chimie', () => {
      const result = validateDomain(
        'Calculer la concentration molaire de NaCl',
        'general'
      )
      expect(result.isValid).toBe(true)
      expect(result.suggestedDomain).toBe('chemistry')
    })
  })
  
  describe('Cohérence domaine/contenu', () => {
    test('suggère le bon domaine si incohérent', () => {
      const result = validateDomain(
        'Calculer la vitesse avec distance et temps',
        'math'
      )
      expect(result.isValid).toBe(true)
      expect(result.suggestedDomain).toBe('physics')
      expect(result.warning).toContain('physics')
    })
  })
})

describe('Input Validation', () => {
  test('accepte input valide', () => {
    const result = validateInput('Résoudre 2x + 3 = 7')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Résoudre 2x + 3 = 7')
  })
  
  test('refuse input null', () => {
    const result = validateInput(null)
    expect(result.isValid).toBe(false)
    expect(result.reason).toContain('vide')
  })
  
  test('refuse input vide', () => {
    const result = validateInput('')
    expect(result.isValid).toBe(false)
    expect(result.reason).toContain('vide')
  })
  
  test('refuse input trop court', () => {
    const result = validateInput('x=2')
    expect(result.isValid).toBe(false)
    expect(result.reason).toContain('trop court')
  })
  
  test('refuse input trop long', () => {
    const longInput = 'x'.repeat(5001)
    const result = validateInput(longInput)
    expect(result.isValid).toBe(false)
    expect(result.reason).toContain('trop long')
  })
  
  test('refuse input avec URL suspecte', () => {
    const result = validateInput('Résoudre http://malicious.com/script')
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('Format de problème non valide')
  })
  
  test('refuse tentative d\'injection', () => {
    const result = validateInput('<script>alert("hack")</script>')
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('Format de problème non valide')
  })
  
  test('refuse spam (caractères répétés)', () => {
    const result = validateInput('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('Format de problème non valide')
  })
  
  test('trim les espaces', () => {
    const result = validateInput('  Résoudre x + 5 = 12  ')
    expect(result.isValid).toBe(true)
    expect(result.sanitized).toBe('Résoudre x + 5 = 12')
  })
})

describe('Error Patterns Structure', () => {
  test('tous les patterns math ont les propriétés requises', () => {
    Object.values(errorPatterns.math).forEach(pattern => {
      expect(pattern).toHaveProperty('check')
      expect(typeof pattern.check).toBe('function')
      expect(pattern).toHaveProperty('error')
      expect(pattern.error).toHaveProperty('type')
      expect(pattern.error).toHaveProperty('icon')
      expect(pattern.error).toHaveProperty('explanation')
      expect(pattern.error).toHaveProperty('correction')
      expect(pattern.error).toHaveProperty('example')
      expect(pattern.error).toHaveProperty('videoUrl')
      expect(pattern.error).toHaveProperty('exerciceUrl')
    })
  })
  
  test('tous les patterns physics ont les propriétés requises', () => {
    Object.values(errorPatterns.physics).forEach(pattern => {
      expect(pattern).toHaveProperty('check')
      expect(pattern).toHaveProperty('error')
    })
  })
  
  test('tous les patterns chemistry ont les propriétés requises', () => {
    Object.values(errorPatterns.chemistry).forEach(pattern => {
      expect(pattern).toHaveProperty('check')
      expect(pattern).toHaveProperty('error')
    })
  })
})










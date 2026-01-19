import { 
  learningProfiles, 
  adaptPromptToProfile, 
  getProfile, 
  getStudyTips,
  getProfileColor,
  isValidProfileId,
  getAllProfileIds
} from '../learningProfiles'

describe('Learning Profiles', () => {
  describe('Profile Structure', () => {
    test('tous les profils ont les propriétés requises', () => {
      Object.values(learningProfiles).forEach(profile => {
        expect(profile).toHaveProperty('id')
        expect(profile).toHaveProperty('icon')
        expect(profile).toHaveProperty('name')
        expect(profile).toHaveProperty('description')
        expect(profile).toHaveProperty('color')
        expect(profile).toHaveProperty('preferences')
        expect(profile).toHaveProperty('learningTips')
        expect(Array.isArray(profile.preferences)).toBe(true)
        expect(Array.isArray(profile.learningTips)).toBe(true)
      })
    })
    
    test('il y a exactement 4 profils', () => {
      expect(Object.keys(learningProfiles)).toHaveLength(4)
    })
    
    test('les IDs sont corrects', () => {
      expect(learningProfiles).toHaveProperty('visual')
      expect(learningProfiles).toHaveProperty('auditory')
      expect(learningProfiles).toHaveProperty('kinesthetic')
      expect(learningProfiles).toHaveProperty('balanced')
    })
  })
  
  describe('adaptPromptToProfile', () => {
    const basePrompt = 'Explique les équations du second degré'
    
    test('adapte le prompt pour profil visuel', () => {
      const adapted = adaptPromptToProfile(basePrompt, 'visual')
      
      expect(adapted).toContain('VISUEL')
      expect(adapted).toContain('schémas')
      expect(adapted).toContain('graphiques')
      expect(adapted).toContain(basePrompt)
    })
    
    test('adapte le prompt pour profil auditif', () => {
      const adapted = adaptPromptToProfile(basePrompt, 'auditory')
      
      expect(adapted).toContain('AUDITIF')
      expect(adapted).toContain('explications verbales')
      expect(adapted).toContain('répétitions')
      expect(adapted).toContain(basePrompt)
    })
    
    test('adapte le prompt pour profil kinesthésique', () => {
      const adapted = adaptPromptToProfile(basePrompt, 'kinesthetic')
      
      expect(adapted).toContain('KINESTHÉSIQUE')
      expect(adapted).toContain('exemples concrets')
      expect(adapted).toContain('pratique')
      expect(adapted).toContain(basePrompt)
    })
    
    test('adapte le prompt pour profil équilibré', () => {
      const adapted = adaptPromptToProfile(basePrompt, 'balanced')
      
      expect(adapted).toContain('ÉQUILIBRÉ')
      expect(adapted).toContain('COMBINE')
      expect(adapted).toContain(basePrompt)
    })
    
    test('utilise profil équilibré par défaut si ID invalide', () => {
      const adapted = adaptPromptToProfile(basePrompt, 'invalid_id')
      
      expect(adapted).toContain('ÉQUILIBRÉ')
    })
  })
  
  describe('getProfile', () => {
    test('retourne le profil correct', () => {
      const profile = getProfile('visual')
      
      expect(profile.id).toBe('visual')
      expect(profile.name).toBe('Visuel')
      expect(profile.icon).toBe('👁️')
    })
    
    test('retourne profil équilibré par défaut', () => {
      const profile = getProfile('invalid_id')
      
      expect(profile.id).toBe('balanced')
    })
  })
  
  describe('getStudyTips', () => {
    test('retourne les conseils du profil', () => {
      const tips = getStudyTips('visual')
      
      expect(Array.isArray(tips)).toBe(true)
      expect(tips.length).toBeGreaterThan(0)
      expect(tips[0]).toContain('visuel')
    })
  })
  
  describe('getProfileColor', () => {
    test('retourne la bonne couleur', () => {
      expect(getProfileColor('visual')).toBe('blue')
      expect(getProfileColor('auditory')).toBe('purple')
      expect(getProfileColor('kinesthetic')).toBe('green')
      expect(getProfileColor('balanced')).toBe('gray')
    })
    
    test('retourne gray par défaut', () => {
      expect(getProfileColor('invalid')).toBe('gray')
    })
  })
  
  describe('isValidProfileId', () => {
    test('valide les IDs corrects', () => {
      expect(isValidProfileId('visual')).toBe(true)
      expect(isValidProfileId('auditory')).toBe(true)
      expect(isValidProfileId('kinesthetic')).toBe(true)
      expect(isValidProfileId('balanced')).toBe(true)
    })
    
    test('invalide les IDs incorrects', () => {
      expect(isValidProfileId('invalid')).toBe(false)
      expect(isValidProfileId('')).toBe(false)
      expect(isValidProfileId(null)).toBe(false)
    })
  })
  
  describe('getAllProfileIds', () => {
    test('retourne tous les IDs', () => {
      const ids = getAllProfileIds()
      
      expect(ids).toHaveLength(4)
      expect(ids).toContain('visual')
      expect(ids).toContain('auditory')
      expect(ids).toContain('kinesthetic')
      expect(ids).toContain('balanced')
    })
  })
})










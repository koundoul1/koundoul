/**
 * 🎓 Profils d'Apprentissage - Koundoul
 * Personnalisation des explications selon le style cognitif
 */

/**
 * Définition des 4 profils d'apprentissage
 */
export const learningProfiles = {
  visual: {
    id: 'visual',
    icon: '👁️',
    name: 'Visuel',
    description: 'Tu apprends mieux avec des schémas, graphiques et représentations visuelles',
    color: 'blue',
    preferences: ['graphiques', 'schémas', 'couleurs', 'diagrammes'],
    learningTips: [
      'Privilégie les représentations visuelles',
      'Utilise des codes couleur pour organiser',
      'Dessine des schémas pour comprendre'
    ]
  },
  
  auditory: {
    id: 'auditory',
    icon: '👂',
    name: 'Auditif',
    description: 'Tu préfères les explications verbales détaillées et les discussions',
    color: 'purple',
    preferences: ['explications', 'répétitions', 'discussions', 'audio'],
    learningTips: [
      'Lis les explications à voix haute',
      'Répète les concepts avec tes mots',
      'Discute avec d\'autres pour apprendre'
    ]
  },
  
  kinesthetic: {
    id: 'kinesthetic',
    icon: '🖐️',
    name: 'Kinesthésique',
    description: 'Tu aimes les exemples concrets, la manipulation et la pratique',
    color: 'green',
    preferences: ['manipulation', 'pratique', 'exemples concrets', 'action'],
    learningTips: [
      'Pratique beaucoup d\'exercices',
      'Utilise des objets réels pour comprendre',
      'Bouge et manipule pendant l\'apprentissage'
    ]
  },
  
  balanced: {
    id: 'balanced',
    icon: '⚖️',
    name: 'Équilibré',
    description: 'Tu combines tous les styles d\'apprentissage selon le contexte',
    color: 'gray',
    preferences: ['varié', 'complet', 'adaptatif', 'flexible'],
    learningTips: [
      'Utilise différentes approches',
      'Adapte ta méthode au sujet',
      'Combine visuel, audio et pratique'
    ]
  }
}

/**
 * Adapte un prompt IA selon le profil d'apprentissage
 * @param {string} basePrompt - Le prompt de base
 * @param {string} profileId - ID du profil ('visual', 'auditory', 'kinesthetic', 'balanced')
 * @returns {string} - Prompt adapté avec instructions spécifiques
 */
export const adaptPromptToProfile = (basePrompt, profileId) => {
  const profile = learningProfiles[profileId] || learningProfiles.balanced
  
  const adaptations = {
    visual: `
**STYLE D'APPRENTISSAGE: VISUEL** 👁️

Instructions spécifiques pour adapter ta réponse:
- PRIVILÉGIE les représentations visuelles (schémas, graphiques, diagrammes)
- Utilise des CODES COULEUR dans les explications quand possible
- Suggère des VISUALISATIONS MENTALES pour chaque concept
- Structure les informations de manière VISUELLEMENT CLAIRE avec sections bien délimitées
- Propose des SCHÉMAS ou GRAPHIQUES quand pertinent
- Utilise des MÉTAPHORES VISUELLES pour expliquer
- Organise le contenu avec des TITRES et SOUS-TITRES bien visibles

Exemple d'approche: "Imagine la fonction comme une courbe qui monte et descend... Visualise un graphique où..."
`,

    auditory: `
**STYLE D'APPRENTISSAGE: AUDITIF** 👂

Instructions spécifiques pour adapter ta réponse:
- Fournis des EXPLICATIONS VERBALES très détaillées et complètes
- Utilise des RÉPÉTITIONS avec reformulations différentes
- Intègre des ANALOGIES NARRATIVES et du storytelling
- Explique comme si tu PARLAIS À VOIX HAUTE à l'élève
- Ajoute des TRANSITIONS EXPLICITES entre les idées ("d'abord", "ensuite", "puis")
- Encourage la DISCUSSION et la verbalisation ("dis-toi que...", "répète avec tes mots...")
- Propose des RAISONNEMENTS LOGIQUES étape par étape avec justifications

Exemple d'approche: "Écoute bien: d'abord on fait ceci parce que..., puis on continue avec cela car..."
`,

    kinesthetic: `
**STYLE D'APPRENTISSAGE: KINESTHÉSIQUE** 🖐️

Instructions spécifiques pour adapter ta réponse:
- Fournis des EXEMPLES CONCRETS et tangibles tirés de la vie réelle
- Propose des SITUATIONS MANIPULABLES et expérimentales
- Utilise des VERBES D'ACTION: "dessine", "trace", "calcule", "essaie", "manipule"
- Suggère des APPLICATIONS PRATIQUES immédiates
- Encourage l'EXPÉRIMENTATION active et la pratique directe
- Donne des EXERCICES ACTIFS à faire en parallèle de l'explication
- Relie les concepts à des EXPÉRIENCES PHYSIQUES concrètes

Exemple d'approche: "Prends ton stylo et trace une droite sur ton papier. Maintenant, observe ce qui se passe quand..."
`,

    balanced: `
**STYLE D'APPRENTISSAGE: ÉQUILIBRÉ** ⚖️

Instructions spécifiques pour adapter ta réponse:
- COMBINE les approches visuelles, auditives et kinesthésiques
- ADAPTE le style selon le contexte et la nature du problème
- Fournis une VARIÉTÉ d'explications (schémas + verbal + pratique)
- Propose PLUSIEURS ANGLES pour comprendre le même concept
- Balance entre théorie abstraite et pratique concrète
- Utilise différents FORMATS (texte structuré, graphique suggéré, exemple pratique)
- Offre FLEXIBILITÉ dans les méthodes de résolution

Exemple d'approche: Mix de schémas explicatifs, explications détaillées et exercices pratiques
`
  }
  
  const profileAdaptation = adaptations[profileId] || adaptations.balanced
  
  return basePrompt + '\n\n' + profileAdaptation
}

/**
 * Obtient un profil par son ID
 * @param {string} profileId - ID du profil
 * @returns {Object} - Objet profil complet
 */
export const getProfile = (profileId) => {
  return learningProfiles[profileId] || learningProfiles.balanced
}

/**
 * Obtient les conseils d'étude pour un profil
 * @param {string} profileId - ID du profil
 * @returns {Array<string>} - Liste des conseils
 */
export const getStudyTips = (profileId) => {
  const profile = getProfile(profileId)
  return profile.learningTips || []
}

/**
 * Obtient la couleur associée à un profil
 * @param {string} profileId - ID du profil
 * @returns {string} - Nom de la couleur ('blue', 'purple', 'green', 'gray')
 */
export const getProfileColor = (profileId) => {
  const profile = getProfile(profileId)
  return profile.color || 'gray'
}

/**
 * Formate un profil pour l'affichage compact
 * @param {string} profileId - ID du profil
 * @returns {Object} - Objet avec icon, name, shortDesc
 */
export const formatProfileForDisplay = (profileId) => {
  const profile = getProfile(profileId)
  return {
    icon: profile.icon,
    name: profile.name,
    shortDesc: profile.preferences.join(', ')
  }
}

/**
 * Obtient tous les IDs de profils disponibles
 * @returns {Array<string>} - Liste des IDs
 */
export const getAllProfileIds = () => {
  return Object.keys(learningProfiles)
}

/**
 * Valide qu'un ID de profil existe
 * @param {string} profileId - ID à valider
 * @returns {boolean} - true si valide
 */
export const isValidProfileId = (profileId) => {
  return profileId in learningProfiles
}

/**
 * Charge le profil depuis localStorage
 * @returns {string} - ID du profil sauvegardé ou 'balanced' par défaut
 */
export const loadProfileFromStorage = () => {
  try {
    const saved = localStorage.getItem('koundoul_learning_profile')
    if (saved && isValidProfileId(saved)) {
      return saved
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
  }
  return 'balanced'
}

/**
 * Sauvegarde le profil dans localStorage
 * @param {string} profileId - ID du profil à sauvegarder
 * @returns {boolean} - true si succès
 */
export const saveProfileToStorage = (profileId) => {
  try {
    if (isValidProfileId(profileId)) {
      localStorage.setItem('koundoul_learning_profile', profileId)
      return true
    }
  } catch (error) {
    console.error('Erreur sauvegarde profil:', error)
  }
  return false
}

export default {
  learningProfiles,
  adaptPromptToProfile,
  getProfile,
  getStudyTips,
  getProfileColor,
  formatProfileForDisplay,
  getAllProfileIds,
  isValidProfileId,
  loadProfileFromStorage,
  saveProfileToStorage
}










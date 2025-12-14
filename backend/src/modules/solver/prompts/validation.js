/**
 * 🔒 Validation des domaines autorisés - Koundoul
 * Refuse poliment les questions hors cadre (Maths/Physique/Chimie uniquement)
 */

// Domaines autorisés
const ALLOWED_DOMAINS = ['math', 'physics', 'chemistry', 'general']

// Mots-clés par domaine (pour détection automatique)
const DOMAIN_KEYWORDS = {
  math: [
    'équation', 'fonction', 'dérivée', 'intégrale', 'limite', 'matrice',
    'vecteur', 'géométrie', 'probabilité', 'statistique', 'algèbre',
    'calcul', 'nombre', 'fraction', 'racine', 'puissance', 'logarithme',
    'trigonométrie', 'suite', 'série', 'graphe', 'courbe', 'polynôme',
    'inéquation', 'système', 'ensemble', 'démonstration', 'théorème'
  ],
  physics: [
    'force', 'masse', 'vitesse', 'accélération', 'énergie', 'puissance',
    'travail', 'pression', 'température', 'chaleur', 'électrique', 'magnétique',
    'lumière', 'onde', 'atome', 'mouvement', 'mécanique', 'thermodynamique',
    'optique', 'cinétique', 'dynamique', 'newton', 'joule', 'watt',
    'volt', 'ampère', 'circuit', 'résistance', 'condensateur', 'gravitation'
  ],
  chemistry: [
    'molécule', 'atome', 'réaction', 'équation chimique', 'élément',
    'composé', 'ion', 'acide', 'base', 'ph', 'oxydation', 'réduction',
    'stœchiométrie', 'concentration', 'mole', 'masse molaire', 'liaison',
    'organique', 'inorganique', 'catalyseur', 'équilibre', 'cinétique',
    'tableau périodique', 'électron', 'proton', 'neutron', 'valence'
  ]
}

// Mots-clés INTERDITS (hors cadre de l'app)
const FORBIDDEN_KEYWORDS = [
  // Sujets personnels/vie quotidienne
  'amour', 'relation', 'ami', 'famille', 'sentiment', 'émotion',
  'conseil', 'psychologie', 'santé', 'maladie', 'médical', 'docteur',
  
  // Histoire/Géographie/Littérature
  'histoire', 'guerre', 'roi', 'président', 'pays', 'capitale',
  'littérature', 'poème', 'roman', 'auteur', 'livre', 'napoléon',
  
  // Autres sujets académiques
  'biologie', 'svt', 'anatomie', 'génétique', 'cellule', 'adn',
  'philosophie', 'sociologie', 'économie', 'droit', 'politique',
  
  // Divertissement
  'film', 'série', 'jeu', 'sport', 'musique', 'chanson', 'football',
  
  // Questions générales inappropriées
  'recette', 'cuisine', 'voyage', 'météo', 'actualité',
  'religion', 'argent', 'emploi', 'shopping', 'mode'
]

/**
 * Valider le domaine de la requête
 * @param {string} input - Texte de la requête
 * @param {string} domain - Domaine déclaré ('math', 'physics', 'chemistry', 'general')
 * @returns {Object} { isValid: boolean, reason?: string, suggestedDomain?: string, message?: string }
 */
export const validateDomain = (input, domain) => {
  const lowerInput = input.toLowerCase()
  
  // 1. Vérifier que le domaine est autorisé
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      reason: 'Domaine non reconnu'
    }
  }
  
  // 2. Détecter les mots-clés interdits (hors cadre)
  const foundForbidden = FORBIDDEN_KEYWORDS.find(keyword => 
    lowerInput.includes(keyword.toLowerCase())
  )
  
  if (foundForbidden) {
    return {
      isValid: false,
      reason: 'out_of_scope',
      message: `Je suis désolé, mais je suis spécialisé uniquement dans l'aide aux devoirs de Mathématiques, Physique et Chimie. 

Ta question semble porter sur un autre sujet ("${foundForbidden}").

📚 Je peux t'aider avec:
- Mathématiques (équations, fonctions, géométrie, etc.)
- Physique (mécanique, électricité, optique, etc.)
- Chimie (réactions, molécules, stœchiométrie, etc.)

Reformule ta question si elle concerne l'un de ces domaines ! 😊`
    }
  }
  
  // 3. Si domaine = 'general', essayer de détecter le vrai domaine
  if (domain === 'general') {
    let maxScore = 0
    let detectedDomain = null
    
    for (const [dom, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      const score = keywords.filter(keyword => 
        lowerInput.includes(keyword.toLowerCase())
      ).length
      
      if (score > maxScore) {
        maxScore = score
        detectedDomain = dom
      }
    }
    
    if (detectedDomain && maxScore >= 2) {
      return {
        isValid: true,
        suggestedDomain: detectedDomain
      }
    }
    
    // Pas de domaine détecté mais pas de mots interdits = accepter prudemment
    if (maxScore === 0) {
      return {
        isValid: true,
        warning: 'Domaine non détecté, traitement générique'
      }
    }
  }
  
  // 4. Vérifier cohérence domaine/contenu
  const domainKeywords = DOMAIN_KEYWORDS[domain] || []
  const keywordMatch = domainKeywords.some(keyword => 
    lowerInput.includes(keyword.toLowerCase())
  )
  
  // Si aucun mot-clé du domaine détecté, vérifier les autres domaines
  if (!keywordMatch && domain !== 'general') {
    for (const [otherDomain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      if (otherDomain === domain) continue
      
      const matchCount = keywords.filter(k => 
        lowerInput.includes(k.toLowerCase())
      ).length
      
      if (matchCount >= 2) {
        return {
          isValid: true,
          suggestedDomain: otherDomain,
          warning: `Le problème semble plutôt être de ${otherDomain}`
        }
      }
    }
  }
  
  // 5. Validation OK
  return {
    isValid: true
  }
}

/**
 * Valider la longueur et le format de l'input
 * @param {string} input - Texte à valider
 * @returns {Object} { isValid: boolean, reason?: string, sanitized?: string }
 */
export const validateInput = (input) => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      reason: 'Le problème ne peut pas être vide'
    }
  }
  
  const trimmed = input.trim()
  
  if (trimmed.length < 5) {
    return {
      isValid: false,
      reason: 'Le problème est trop court. Décris ton problème en détail.'
    }
  }
  
  if (trimmed.length > 2000) {
    return {
      isValid: false,
      reason: 'Le problème est trop long (max 2000 caractères)'
    }
  }
  
  // Détecter les tentatives de spam/injection
  const suspiciousPatterns = [
    /(.)\1{20,}/,  // Même caractère répété 20+ fois
    /https?:\/\//gi,  // URLs (généralement pas dans un problème de maths)
    /<script/i,  // Tentative injection
    /\bexec\b|\beval\b/i  // Mots-clés dangereux
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Format de problème non valide'
      }
    }
  }
  
  return {
    isValid: true,
    sanitized: trimmed
  }
}

export default { validateDomain, validateInput, ALLOWED_DOMAINS, DOMAIN_KEYWORDS, FORBIDDEN_KEYWORDS }










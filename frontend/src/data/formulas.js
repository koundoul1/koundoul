/**
 * 📐 FORMULES SCIENTIFIQUES - KOUNDOUL
 * Base de données complète des formules pour la résolution de problèmes
 */

// ========================================
// FORMULES DE MÉCANIQUE
// ========================================

export const MECHANICS_FORMULAS = {
  // Cinématique
  VELOCITY: {
    name: 'Vitesse',
    formula: 'v = Δx/Δt',
    domain: 'mécanique',
    description: 'Vitesse moyenne en mouvement rectiligne',
    variables: {
      'v': 'vitesse (m/s)',
      'Δx': 'déplacement (m)',
      'Δt': 'intervalle de temps (s)'
    },
    category: 'kinematics'
  },

  ACCELERATION: {
    name: 'Accélération',
    formula: 'a = Δv/Δt',
    domain: 'mécanique',
    description: 'Accélération moyenne',
    variables: {
      'a': 'accélération (m/s²)',
      'Δv': 'variation de vitesse (m/s)',
      'Δt': 'intervalle de temps (s)'
    },
    category: 'kinematics'
  },

  UNIFORM_ACCELERATION: {
    name: 'Mouvement uniformément accéléré',
    formula: 'x = x₀ + v₀t + ½at²',
    domain: 'mécanique',
    description: 'Position dans un mouvement uniformément accéléré',
    variables: {
      'x': 'position finale (m)',
      'x₀': 'position initiale (m)',
      'v₀': 'vitesse initiale (m/s)',
      't': 'temps (s)',
      'a': 'accélération (m/s²)'
    },
    category: 'kinematics'
  },

  VELOCITY_TIME: {
    name: 'Vitesse en fonction du temps',
    formula: 'v = v₀ + at',
    domain: 'mécanique',
    description: 'Vitesse dans un mouvement uniformément accéléré',
    variables: {
      'v': 'vitesse finale (m/s)',
      'v₀': 'vitesse initiale (m/s)',
      'a': 'accélération (m/s²)',
      't': 'temps (s)'
    },
    category: 'kinematics'
  },

  // Dynamique
  NEWTON_SECOND_LAW: {
    name: 'Deuxième loi de Newton',
    formula: 'F = ma',
    domain: 'mécanique',
    description: 'Relation entre force, masse et accélération',
    variables: {
      'F': 'force (N)',
      'm': 'masse (kg)',
      'a': 'accélération (m/s²)'
    },
    category: 'dynamics'
  },

  GRAVITATIONAL_FORCE: {
    name: 'Force gravitationnelle',
    formula: 'F = G(m₁m₂)/r²',
    domain: 'mécanique',
    description: 'Force d\'attraction gravitationnelle entre deux masses',
    variables: {
      'F': 'force gravitationnelle (N)',
      'G': 'constante de gravitation (6.674×10⁻¹¹ N·m²/kg²)',
      'm₁': 'masse du premier objet (kg)',
      'm₂': 'masse du second objet (kg)',
      'r': 'distance entre les centres (m)'
    },
    category: 'dynamics'
  },

  WEIGHT: {
    name: 'Poids',
    formula: 'P = mg',
    domain: 'mécanique',
    description: 'Force de gravité sur un objet',
    variables: {
      'P': 'poids (N)',
      'm': 'masse (kg)',
      'g': 'accélération de la pesanteur (9.81 m/s²)'
    },
    category: 'dynamics'
  },

  // Énergie
  KINETIC_ENERGY: {
    name: 'Énergie cinétique',
    formula: 'Ec = ½mv²',
    domain: 'mécanique',
    description: 'Énergie liée au mouvement',
    variables: {
      'Ec': 'énergie cinétique (J)',
      'm': 'masse (kg)',
      'v': 'vitesse (m/s)'
    },
    category: 'energy'
  },

  POTENTIAL_ENERGY: {
    name: 'Énergie potentielle de pesanteur',
    formula: 'Ep = mgh',
    domain: 'mécanique',
    description: 'Énergie liée à la position dans le champ de pesanteur',
    variables: {
      'Ep': 'énergie potentielle (J)',
      'm': 'masse (kg)',
      'g': 'accélération de la pesanteur (9.81 m/s²)',
      'h': 'hauteur (m)'
    },
    category: 'energy'
  },

  MECHANICAL_ENERGY: {
    name: 'Énergie mécanique',
    formula: 'Em = Ec + Ep',
    domain: 'mécanique',
    description: 'Somme de l\'énergie cinétique et potentielle',
    variables: {
      'Em': 'énergie mécanique (J)',
      'Ec': 'énergie cinétique (J)',
      'Ep': 'énergie potentielle (J)'
    },
    category: 'energy'
  },

  WORK: {
    name: 'Travail d\'une force',
    formula: 'W = F·d·cos(θ)',
    domain: 'mécanique',
    description: 'Travail effectué par une force',
    variables: {
      'W': 'travail (J)',
      'F': 'force (N)',
      'd': 'déplacement (m)',
      'θ': 'angle entre force et déplacement (rad)'
    },
    category: 'energy'
  },

  POWER: {
    name: 'Puissance',
    formula: 'P = W/t',
    domain: 'mécanique',
    description: 'Puissance moyenne',
    variables: {
      'P': 'puissance (W)',
      'W': 'travail (J)',
      't': 'temps (s)'
    },
    category: 'energy'
  }
};

// ========================================
// FORMULES D'ÉLECTROMAGNÉTISME
// ========================================

export const ELECTROMAGNETISM_FORMULAS = {
  // Électrostatique
  COULOMB_LAW: {
    name: 'Loi de Coulomb',
    formula: 'F = k(q₁q₂)/r²',
    domain: 'électromagnétisme',
    description: 'Force électrostatique entre deux charges',
    variables: {
      'F': 'force électrostatique (N)',
      'k': 'constante de Coulomb (9×10⁹ N·m²/C²)',
      'q₁': 'première charge (C)',
      'q₂': 'seconde charge (C)',
      'r': 'distance entre charges (m)'
    },
    category: 'electrostatics'
  },

  ELECTRIC_FIELD: {
    name: 'Champ électrique',
    formula: 'E = F/q',
    domain: 'électromagnétisme',
    description: 'Intensité du champ électrique',
    variables: {
      'E': 'champ électrique (N/C)',
      'F': 'force électrostatique (N)',
      'q': 'charge d\'essai (C)'
    },
    category: 'electrostatics'
  },

  ELECTRIC_POTENTIAL: {
    name: 'Potentiel électrique',
    formula: 'V = U/q',
    domain: 'électromagnétisme',
    description: 'Potentiel électrique en un point',
    variables: {
      'V': 'potentiel électrique (V)',
      'U': 'énergie potentielle électrique (J)',
      'q': 'charge (C)'
    },
    category: 'electrostatics'
  },

  CAPACITANCE: {
    name: 'Capacité d\'un condensateur',
    formula: 'C = Q/V',
    domain: 'électromagnétisme',
    description: 'Capacité d\'un condensateur',
    variables: {
      'C': 'capacité (F)',
      'Q': 'charge (C)',
      'V': 'tension (V)'
    },
    category: 'electrostatics'
  },

  // Électrocinétique
  OHMS_LAW: {
    name: 'Loi d\'Ohm',
    formula: 'U = RI',
    domain: 'électromagnétisme',
    description: 'Relation tension-résistance-courant',
    variables: {
      'U': 'tension (V)',
      'R': 'résistance (Ω)',
      'I': 'intensité du courant (A)'
    },
    category: 'electrokinetics'
  },

  ELECTRIC_POWER: {
    name: 'Puissance électrique',
    formula: 'P = UI',
    domain: 'électromagnétisme',
    description: 'Puissance électrique',
    variables: {
      'P': 'puissance (W)',
      'U': 'tension (V)',
      'I': 'intensité du courant (A)'
    },
    category: 'electrokinetics'
  },

  ELECTRIC_ENERGY: {
    name: 'Énergie électrique',
    formula: 'E = Pt',
    domain: 'électromagnétisme',
    description: 'Énergie électrique consommée',
    variables: {
      'E': 'énergie (J)',
      'P': 'puissance (W)',
      't': 'temps (s)'
    },
    category: 'electrokinetics'
  },

  // Magnétisme
  MAGNETIC_FORCE: {
    name: 'Force de Lorentz',
    formula: 'F = qvBsin(θ)',
    domain: 'électromagnétisme',
    description: 'Force magnétique sur une charge en mouvement',
    variables: {
      'F': 'force magnétique (N)',
      'q': 'charge (C)',
      'v': 'vitesse (m/s)',
      'B': 'champ magnétique (T)',
      'θ': 'angle entre v et B (rad)'
    },
    category: 'magnetism'
  },

  MAGNETIC_FLUX: {
    name: 'Flux magnétique',
    formula: 'Φ = BAcos(θ)',
    domain: 'électromagnétisme',
    description: 'Flux magnétique à travers une surface',
    variables: {
      'Φ': 'flux magnétique (Wb)',
      'B': 'champ magnétique (T)',
      'A': 'aire de la surface (m²)',
      'θ': 'angle entre B et la normale (rad)'
    },
    category: 'magnetism'
  }
};

// ========================================
// FORMULES DE THERMODYNAMIQUE
// ========================================

export const THERMODYNAMICS_FORMULAS = {
  // Gaz parfaits
  IDEAL_GAS_LAW: {
    name: 'Loi des gaz parfaits',
    formula: 'PV = nRT',
    domain: 'thermodynamique',
    description: 'Relation entre pression, volume et température',
    variables: {
      'P': 'pression (Pa)',
      'V': 'volume (m³)',
      'n': 'quantité de matière (mol)',
      'R': 'constante des gaz parfaits (8.314 J/(mol·K))',
      'T': 'température (K)'
    },
    category: 'gas_laws'
  },

  BOYLE_LAW: {
    name: 'Loi de Boyle-Mariotte',
    formula: 'P₁V₁ = P₂V₂',
    domain: 'thermodynamique',
    description: 'Relation pression-volume à température constante',
    variables: {
      'P₁': 'pression initiale (Pa)',
      'V₁': 'volume initial (m³)',
      'P₂': 'pression finale (Pa)',
      'V₂': 'volume final (m³)'
    },
    category: 'gas_laws'
  },

  CHARLES_LAW: {
    name: 'Loi de Charles',
    formula: 'V₁/T₁ = V₂/T₂',
    domain: 'thermodynamique',
    description: 'Relation volume-température à pression constante',
    variables: {
      'V₁': 'volume initial (m³)',
      'T₁': 'température initiale (K)',
      'V₂': 'volume final (m³)',
      'T₂': 'température finale (K)'
    },
    category: 'gas_laws'
  },

  // Énergie thermique
  HEAT_CAPACITY: {
    name: 'Capacité thermique',
    formula: 'Q = mcΔT',
    domain: 'thermodynamique',
    description: 'Quantité de chaleur échangée',
    variables: {
      'Q': 'quantité de chaleur (J)',
      'm': 'masse (kg)',
      'c': 'capacité thermique massique (J/(kg·K))',
      'ΔT': 'variation de température (K)'
    },
    category: 'heat'
  },

  LATENT_HEAT: {
    name: 'Chaleur latente',
    formula: 'Q = mL',
    domain: 'thermodynamique',
    description: 'Chaleur nécessaire pour le changement d\'état',
    variables: {
      'Q': 'quantité de chaleur (J)',
      'm': 'masse (kg)',
      'L': 'chaleur latente (J/kg)'
    },
    category: 'heat'
  },

  // Rayonnement
  STEFAN_BOLTZMANN: {
    name: 'Loi de Stefan-Boltzmann',
    formula: 'P = σAT⁴',
    domain: 'thermodynamique',
    description: 'Puissance rayonnée par un corps noir',
    variables: {
      'P': 'puissance rayonnée (W)',
      'σ': 'constante de Stefan-Boltzmann (5.670×10⁻⁸ W/(m²·K⁴))',
      'A': 'aire de la surface (m²)',
      'T': 'température (K)'
    },
    category: 'radiation'
  },

  WIEN_LAW: {
    name: 'Loi de Wien',
    formula: 'λmax = b/T',
    domain: 'thermodynamique',
    description: 'Longueur d\'onde du maximum d\'émission',
    variables: {
      'λmax': 'longueur d\'onde du maximum (m)',
      'b': 'constante de Wien (2.898×10⁻³ m·K)',
      'T': 'température (K)'
    },
    category: 'radiation'
  }
};

// ========================================
// FORMULES D'OPTIQUE
// ========================================

export const OPTICS_FORMULAS = {
  // Réflexion
  REFLECTION_LAW: {
    name: 'Loi de la réflexion',
    formula: 'θᵢ = θᵣ',
    domain: 'optique',
    description: 'Angles d\'incidence et de réflexion égaux',
    variables: {
      'θᵢ': 'angle d\'incidence (rad)',
      'θᵣ': 'angle de réflexion (rad)'
    },
    category: 'reflection'
  },

  // Réfraction
  SNELL_LAW: {
    name: 'Loi de Snell-Descartes',
    formula: 'n₁sin(θ₁) = n₂sin(θ₂)',
    domain: 'optique',
    description: 'Loi de la réfraction',
    variables: {
      'n₁': 'indice de réfraction du premier milieu',
      'θ₁': 'angle d\'incidence (rad)',
      'n₂': 'indice de réfraction du second milieu',
      'θ₂': 'angle de réfraction (rad)'
    },
    category: 'refraction'
  },

  REFRACTIVE_INDEX: {
    name: 'Indice de réfraction',
    formula: 'n = c/v',
    domain: 'optique',
    description: 'Rapport entre vitesse de la lumière dans le vide et dans le milieu',
    variables: {
      'n': 'indice de réfraction',
      'c': 'vitesse de la lumière dans le vide (m/s)',
      'v': 'vitesse de la lumière dans le milieu (m/s)'
    },
    category: 'refraction'
  },

  // Lentilles
  THIN_LENS_EQUATION: {
    name: 'Formule des lentilles minces',
    formula: '1/f = 1/p + 1/q',
    domain: 'optique',
    description: 'Relation entre distance focale, objet et image',
    variables: {
      'f': 'distance focale (m)',
      'p': 'distance objet-lentille (m)',
      'q': 'distance image-lentille (m)'
    },
    category: 'lenses'
  },

  MAGNIFICATION: {
    name: 'Grandissement',
    formula: 'γ = -q/p',
    domain: 'optique',
    description: 'Rapport entre taille de l\'image et de l\'objet',
    variables: {
      'γ': 'grandissement',
      'q': 'distance image-lentille (m)',
      'p': 'distance objet-lentille (m)'
    },
    category: 'lenses'
  }
};

// ========================================
// FORMULES DE CHIMIE
// ========================================

export const CHEMISTRY_FORMULAS = {
  // Solutions
  MOLARITY: {
    name: 'Molarité',
    formula: 'C = n/V',
    domain: 'chimie',
    description: 'Concentration molaire d\'une solution',
    variables: {
      'C': 'concentration molaire (mol/L)',
      'n': 'quantité de matière (mol)',
      'V': 'volume de la solution (L)'
    },
    category: 'solutions'
  },

  MOLALITY: {
    name: 'Molalité',
    formula: 'b = n/mₛₒₗᵥₑₙₜ',
    domain: 'chimie',
    description: 'Concentration molaire par kilogramme de solvant',
    variables: {
      'b': 'molalité (mol/kg)',
      'n': 'quantité de matière (mol)',
      'mₛₒₗᵥₑₙₜ': 'masse du solvant (kg)'
    },
    category: 'solutions'
  },

  MASS_PERCENTAGE: {
    name: 'Pourcentage massique',
    formula: '%m = (mₛₒₗᵤₜₑ/mₛₒₗᵤₜᵢₒₙ) × 100',
    domain: 'chimie',
    description: 'Pourcentage en masse du soluté',
    variables: {
      '%m': 'pourcentage massique (%)',
      'mₛₒₗᵤₜₑ': 'masse du soluté (g)',
      'mₛₒₗᵤₜᵢₒₙ': 'masse de la solution (g)'
    },
    category: 'solutions'
  },

  // Équilibre chimique
  EQUILIBRIUM_CONSTANT: {
    name: 'Constante d\'équilibre',
    formula: 'Kc = [C]ᶜ[D]ᵈ/[A]ᵃ[B]ᵇ',
    domain: 'chimie',
    description: 'Constante d\'équilibre en concentrations',
    variables: {
      'Kc': 'constante d\'équilibre',
      '[A]': 'concentration de A (mol/L)',
      '[B]': 'concentration de B (mol/L)',
      '[C]': 'concentration de C (mol/L)',
      '[D]': 'concentration de D (mol/L)',
      'a,b,c,d': 'coefficients stœchiométriques'
    },
    category: 'equilibrium'
  },

  // Thermodynamique chimique
  ENTHALPY: {
    name: 'Enthalpie',
    formula: 'H = U + PV',
    domain: 'chimie',
    description: 'Enthalpie d\'un système',
    variables: {
      'H': 'enthalpie (J)',
      'U': 'énergie interne (J)',
      'P': 'pression (Pa)',
      'V': 'volume (m³)'
    },
    category: 'thermodynamics'
  },

  GIBBS_FREE_ENERGY: {
    name: 'Énergie libre de Gibbs',
    formula: 'ΔG = ΔH - TΔS',
    domain: 'chimie',
    description: 'Énergie libre de Gibbs',
    variables: {
      'ΔG': 'variation d\'énergie libre (J)',
      'ΔH': 'variation d\'enthalpie (J)',
      'T': 'température (K)',
      'ΔS': 'variation d\'entropie (J/K)'
    },
    category: 'thermodynamics'
  }
};

// ========================================
// FORMULES MATHÉMATIQUES
// ========================================

export const MATHEMATICS_FORMULAS = {
  // Géométrie
  CIRCLE_AREA: {
    name: 'Aire d\'un cercle',
    formula: 'A = πr²',
    domain: 'mathématiques',
    description: 'Aire d\'un cercle de rayon r',
    variables: {
      'A': 'aire (m²)',
      'r': 'rayon (m)',
      'π': 'pi (3.14159...)'
    },
    category: 'geometry'
  },

  CIRCLE_CIRCUMFERENCE: {
    name: 'Circonférence d\'un cercle',
    formula: 'C = 2πr',
    domain: 'mathématiques',
    description: 'Circonférence d\'un cercle de rayon r',
    variables: {
      'C': 'circonférence (m)',
      'r': 'rayon (m)',
      'π': 'pi (3.14159...)'
    },
    category: 'geometry'
  },

  SPHERE_VOLUME: {
    name: 'Volume d\'une sphère',
    formula: 'V = (4/3)πr³',
    domain: 'mathématiques',
    description: 'Volume d\'une sphère de rayon r',
    variables: {
      'V': 'volume (m³)',
      'r': 'rayon (m)',
      'π': 'pi (3.14159...)'
    },
    category: 'geometry'
  },

  SPHERE_AREA: {
    name: 'Aire d\'une sphère',
    formula: 'A = 4πr²',
    domain: 'mathématiques',
    description: 'Aire d\'une sphère de rayon r',
    variables: {
      'A': 'aire (m²)',
      'r': 'rayon (m)',
      'π': 'pi (3.14159...)'
    },
    category: 'geometry'
  },

  // Trigonométrie
  PYTHAGOREAN_THEOREM: {
    name: 'Théorème de Pythagore',
    formula: 'c² = a² + b²',
    domain: 'mathématiques',
    description: 'Relation dans un triangle rectangle',
    variables: {
      'c': 'hypoténuse',
      'a': 'côté adjacent',
      'b': 'côté opposé'
    },
    category: 'trigonometry'
  },

  SINE_LAW: {
    name: 'Loi des sinus',
    formula: 'a/sin(A) = b/sin(B) = c/sin(C)',
    domain: 'mathématiques',
    description: 'Relation dans un triangle quelconque',
    variables: {
      'a,b,c': 'longueurs des côtés',
      'A,B,C': 'angles opposés'
    },
    category: 'trigonometry'
  },

  COSINE_LAW: {
    name: 'Loi des cosinus',
    formula: 'c² = a² + b² - 2ab·cos(C)',
    domain: 'mathématiques',
    description: 'Relation dans un triangle quelconque',
    variables: {
      'a,b,c': 'longueurs des côtés',
      'C': 'angle entre a et b'
    },
    category: 'trigonometry'
  }
};

// ========================================
// RÉFÉRENCE COMPLÈTE
// ========================================

export const ALL_FORMULAS = {
  ...MECHANICS_FORMULAS,
  ...ELECTROMAGNETISM_FORMULAS,
  ...THERMODYNAMICS_FORMULAS,
  ...OPTICS_FORMULAS,
  ...CHEMISTRY_FORMULAS,
  ...MATHEMATICS_FORMULAS
};

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Recherche des formules par domaine
 * @param {string} domain - Domaine (ex: 'mécanique', 'électromagnétisme')
 * @returns {Array} - Liste des formules du domaine
 */
export function findFormulasByDomain(domain) {
  return Object.values(ALL_FORMULAS).filter(formula => 
    formula.domain === domain
  );
}

/**
 * Recherche des formules par catégorie
 * @param {string} category - Catégorie (ex: 'kinematics', 'energy')
 * @returns {Array} - Liste des formules de la catégorie
 */
export function findFormulasByCategory(category) {
  return Object.values(ALL_FORMULAS).filter(formula => 
    formula.category === category
  );
}

/**
 * Recherche des formules par nom
 * @param {string} name - Nom de la formule
 * @returns {Array} - Liste des formules correspondantes
 */
export function findFormulasByName(name) {
  const lowerName = name.toLowerCase();
  return Object.values(ALL_FORMULAS).filter(formula => 
    formula.name.toLowerCase().includes(lowerName)
  );
}

/**
 * Recherche des formules par description
 * @param {string} keyword - Mot-clé dans la description
 * @returns {Array} - Liste des formules correspondantes
 */
export function findFormulasByDescription(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(ALL_FORMULAS).filter(formula => 
    formula.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Obtient tous les domaines disponibles
 * @returns {Array} - Liste des domaines
 */
export function getAllDomains() {
  return [...new Set(Object.values(ALL_FORMULAS).map(formula => formula.domain))];
}

/**
 * Obtient toutes les catégories disponibles
 * @returns {Array} - Liste des catégories
 */
export function getAllCategories() {
  return [...new Set(Object.values(ALL_FORMULAS).map(formula => formula.category))];
}

/**
 * Formate une formule pour l'affichage
 * @param {Object} formula - Formule à formater
 * @returns {string} - Chaîne formatée
 */
export function formatFormula(formula) {
  if (!formula) return '';
  
  return `${formula.name}: ${formula.formula} - ${formula.description}`;
}

/**
 * Recherche des formules les plus utilisées
 * @param {string} domain - Domaine spécifique (optionnel)
 * @returns {Array} - Liste des formules essentielles
 */
export function getEssentialFormulas(domain = null) {
  const essentialNames = [
    'Vitesse', 'Accélération', 'Deuxième loi de Newton', 'Énergie cinétique',
    'Loi d\'Ohm', 'Puissance électrique', 'Loi des gaz parfaits',
    'Loi de Snell-Descartes', 'Molarité', 'Aire d\'un cercle'
  ];
  
  let formulas = Object.values(ALL_FORMULAS);
  if (domain) {
    formulas = formulas.filter(formula => formula.domain === domain);
  }
  
  return formulas.filter(formula => 
    essentialNames.some(name => formula.name.includes(name))
  );
}

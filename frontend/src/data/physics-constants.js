/**
 * 🌌 CONSTANTES PHYSIQUES FONDAMENTALES - KOUNDOUL
 * Base de données complète des constantes pour la résolution de problèmes
 */

// ========================================
// CONSTANTES FONDAMENTALES
// ========================================

export const FUNDAMENTAL_CONSTANTS = {
  // Vitesse de la lumière
  SPEED_OF_LIGHT: {
    symbol: 'c',
    value: 2.998e8,
    unit: 'm/s',
    description: 'Vitesse de la lumière dans le vide',
    category: 'fundamental'
  },

  // Constante de Planck
  PLANCK_CONSTANT: {
    symbol: 'h',
    value: 6.626e-34,
    unit: 'J·s',
    description: 'Quantum d\'action',
    category: 'fundamental'
  },

  // Constante de Planck réduite
  PLANCK_REDUCED: {
    symbol: 'ℏ',
    value: 1.055e-34,
    unit: 'J·s',
    description: 'h/2π',
    category: 'fundamental'
  },

  // Constante de gravitation
  GRAVITATIONAL_CONSTANT: {
    symbol: 'G',
    value: 6.674e-11,
    unit: 'N·m²/kg²',
    description: 'Constante de gravitation universelle',
    category: 'fundamental'
  },

  // Charge élémentaire
  ELEMENTARY_CHARGE: {
    symbol: 'e',
    value: 1.602e-19,
    unit: 'C',
    description: 'Charge de l\'électron',
    category: 'fundamental'
  }
};

// ========================================
// CONSTANTES ÉLECTROMAGNÉTIQUES
// ========================================

export const ELECTROMAGNETIC_CONSTANTS = {
  // Permittivité du vide
  VACUUM_PERMITTIVITY: {
    symbol: 'ε₀',
    value: 8.854e-12,
    unit: 'F/m',
    description: 'Constante électrique du vide',
    category: 'electromagnetic'
  },

  // Perméabilité du vide
  VACUUM_PERMEABILITY: {
    symbol: 'μ₀',
    value: 1.257e-6,
    unit: 'H/m',
    description: 'Constante magnétique du vide',
    category: 'electromagnetic'
  },

  // Constante de structure fine
  FINE_STRUCTURE_CONSTANT: {
    symbol: 'α',
    value: 7.297e-3,
    unit: '',
    description: 'Couplage électromagnétique (≈1/137)',
    category: 'electromagnetic'
  },

  // Constante de Faraday
  FARADAY_CONSTANT: {
    symbol: 'F',
    value: 96485,
    unit: 'C/mol',
    description: 'Charge par mole d\'électrons',
    category: 'electromagnetic'
  }
};

// ========================================
// CONSTANTES THERMODYNAMIQUES
// ========================================

export const THERMODYNAMIC_CONSTANTS = {
  // Constante des gaz parfaits
  IDEAL_GAS_CONSTANT: {
    symbol: 'R',
    value: 8.314,
    unit: 'J/(mol·K)',
    description: 'Constante des gaz parfaits',
    category: 'thermodynamic'
  },

  // Nombre d'Avogadro
  AVOGADRO_NUMBER: {
    symbol: 'Nₐ',
    value: 6.022e23,
    unit: 'mol⁻¹',
    description: 'Nombre de particules par mole',
    category: 'thermodynamic'
  },

  // Constante de Boltzmann
  BOLTZMANN_CONSTANT: {
    symbol: 'k',
    value: 1.381e-23,
    unit: 'J/K',
    description: 'Constante de Boltzmann',
    category: 'thermodynamic'
  },

  // Constante de Stefan-Boltzmann
  STEFAN_BOLTZMANN: {
    symbol: 'σ',
    value: 5.670e-8,
    unit: 'W/(m²·K⁴)',
    description: 'Constante de rayonnement du corps noir',
    category: 'thermodynamic'
  },

  // Constante de Wien
  WIEN_CONSTANT: {
    symbol: 'b',
    value: 2.898e-3,
    unit: 'm·K',
    description: 'Constante de déplacement de Wien',
    category: 'thermodynamic'
  }
};

// ========================================
// CONSTANTES DES PARTICULES
// ========================================

export const PARTICLE_CONSTANTS = {
  // Masse de l'électron
  ELECTRON_MASS: {
    symbol: 'mₑ',
    value: 9.109e-31,
    unit: 'kg',
    description: 'Masse de l\'électron',
    category: 'particle'
  },

  // Masse du proton
  PROTON_MASS: {
    symbol: 'mₚ',
    value: 1.673e-27,
    unit: 'kg',
    description: 'Masse du proton',
    category: 'particle'
  },

  // Masse du neutron
  NEUTRON_MASS: {
    symbol: 'mₙ',
    value: 1.675e-27,
    unit: 'kg',
    description: 'Masse du neutron',
    category: 'particle'
  },

  // Unité de masse atomique
  ATOMIC_MASS_UNIT: {
    symbol: 'u',
    value: 1.661e-27,
    unit: 'kg',
    description: '1/12 de la masse du ¹²C',
    category: 'particle'
  },

  // Rayon de Bohr
  BOHR_RADIUS: {
    symbol: 'a₀',
    value: 5.292e-11,
    unit: 'm',
    description: 'Rayon de l\'atome d\'hydrogène',
    category: 'particle'
  },

  // Constante de Rydberg
  RYDBERG_CONSTANT: {
    symbol: 'R∞',
    value: 1.097e7,
    unit: 'm⁻¹',
    description: 'Constante de Rydberg pour l\'hydrogène',
    category: 'particle'
  },

  // Énergie de Rydberg
  RYDBERG_ENERGY: {
    symbol: 'Ry',
    value: 2.180e-18,
    unit: 'J',
    description: 'Énergie d\'ionisation de l\'hydrogène',
    category: 'particle'
  },

  // Magnéton de Bohr
  BOHR_MAGNETON: {
    symbol: 'μB',
    value: 9.274e-24,
    unit: 'J/T',
    description: 'Moment magnétique de l\'électron',
    category: 'particle'
  },

  // Magnéton nucléaire
  NUCLEAR_MAGNETON: {
    symbol: 'μN',
    value: 5.051e-27,
    unit: 'J/T',
    description: 'Moment magnétique nucléaire',
    category: 'particle'
  }
};

// ========================================
// CONSTANTES ASTRONOMIQUES
// ========================================

export const ASTRONOMICAL_CONSTANTS = {
  // Unité astronomique
  ASTRONOMICAL_UNIT: {
    symbol: 'UA',
    value: 1.496e11,
    unit: 'm',
    description: 'Distance moyenne Terre-Soleil',
    category: 'astronomical'
  },

  // Année-lumière
  LIGHT_YEAR: {
    symbol: 'al',
    value: 9.461e15,
    unit: 'm',
    description: 'Distance parcourue par la lumière en 1 an',
    category: 'astronomical'
  },

  // Parsec
  PARSEC: {
    symbol: 'pc',
    value: 3.086e16,
    unit: 'm',
    description: 'Parallaxe d\'une seconde d\'arc',
    category: 'astronomical'
  },

  // Constante de Hubble
  HUBBLE_CONSTANT: {
    symbol: 'H₀',
    value: 70,
    unit: 'km/(s·Mpc)',
    description: 'Constante de l\'expansion de l\'univers',
    category: 'astronomical'
  },

  // Masse solaire
  SOLAR_MASS: {
    symbol: 'M☉',
    value: 1.989e30,
    unit: 'kg',
    description: 'Masse du Soleil',
    category: 'astronomical'
  },

  // Rayon solaire
  SOLAR_RADIUS: {
    symbol: 'R☉',
    value: 6.957e8,
    unit: 'm',
    description: 'Rayon du Soleil',
    category: 'astronomical'
  },

  // Luminosité solaire
  SOLAR_LUMINOSITY: {
    symbol: 'L☉',
    value: 3.828e26,
    unit: 'W',
    description: 'Puissance rayonnée par le Soleil',
    category: 'astronomical'
  }
};

// ========================================
// CONSTANTES DE CONVERSION
// ========================================

export const CONVERSION_CONSTANTS = {
  // Électronvolt
  ELECTRONVOLT: {
    symbol: 'eV',
    value: 1.602e-19,
    unit: 'J',
    description: 'Unité d\'énergie atomique',
    category: 'conversion'
  },

  // Calorie
  CALORIE: {
    symbol: 'cal',
    value: 4.184,
    unit: 'J',
    description: 'Unité thermique',
    category: 'conversion'
  },

  // Atmosphère
  ATMOSPHERE: {
    symbol: 'atm',
    value: 101325,
    unit: 'Pa',
    description: 'Unité de pression',
    category: 'conversion'
  },

  // Zéro absolu
  ABSOLUTE_ZERO: {
    symbol: '0 K',
    value: -273.15,
    unit: '°C',
    description: 'Température minimale',
    category: 'conversion'
  },

  // Volume molaire (TPN)
  MOLAR_VOLUME_STP: {
    symbol: 'Vm',
    value: 22.414,
    unit: 'L/mol',
    description: 'Volume molaire à 273.15 K et 101.325 kPa',
    category: 'conversion'
  }
};

// ========================================
// RÉFÉRENCE COMPLÈTE
// ========================================

export const ALL_PHYSICS_CONSTANTS = {
  ...FUNDAMENTAL_CONSTANTS,
  ...ELECTROMAGNETIC_CONSTANTS,
  ...THERMODYNAMIC_CONSTANTS,
  ...PARTICLE_CONSTANTS,
  ...ASTRONOMICAL_CONSTANTS,
  ...CONVERSION_CONSTANTS
};

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Recherche une constante par symbole
 * @param {string} symbol - Symbole de la constante (ex: 'c', 'h', 'G')
 * @returns {Object|null} - Constante trouvée ou null
 */
export function findConstantBySymbol(symbol) {
  return Object.values(ALL_PHYSICS_CONSTANTS).find(constant => 
    constant.symbol === symbol
  );
}

/**
 * Recherche des constantes par catégorie
 * @param {string} category - Catégorie (ex: 'fundamental', 'particle', 'astronomical')
 * @returns {Array} - Liste des constantes de la catégorie
 */
export function findConstantsByCategory(category) {
  return Object.values(ALL_PHYSICS_CONSTANTS).filter(constant => 
    constant.category === category
  );
}

/**
 * Recherche des constantes par description
 * @param {string} keyword - Mot-clé dans la description
 * @returns {Array} - Liste des constantes correspondantes
 */
export function findConstantsByDescription(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(ALL_PHYSICS_CONSTANTS).filter(constant => 
    constant.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Obtient toutes les catégories disponibles
 * @returns {Array} - Liste des catégories
 */
export function getAllCategories() {
  return [...new Set(Object.values(ALL_PHYSICS_CONSTANTS).map(constant => constant.category))];
}

/**
 * Formate une constante pour l'affichage
 * @param {Object} constant - Constante à formater
 * @returns {string} - Chaîne formatée
 */
export function formatConstant(constant) {
  if (!constant) return '';
  
  return `${constant.symbol} = ${constant.value.toExponential(3)} ${constant.unit} (${constant.description})`;
}

/**
 * Obtient les constantes les plus utilisées
 * @returns {Array} - Liste des constantes essentielles
 */
export function getEssentialConstants() {
  const essentialSymbols = ['c', 'h', 'G', 'e', 'k', 'R', 'Nₐ', 'mₑ', 'mₚ', 'α'];
  return essentialSymbols.map(symbol => findConstantBySymbol(symbol)).filter(Boolean);
}

/**
 * 🔄 SYSTÈME DE CONVERSION D'UNITÉS - KOUNDOUL
 * Conversions automatiques pour la résolution de problèmes
 */

// ========================================
// CONVERSIONS DE LONGUEUR
// ========================================

export const LENGTH_CONVERSIONS = {
  // Métrique
  'm': 1,
  'mm': 0.001,
  'cm': 0.01,
  'dm': 0.1,
  'km': 1000,
  
  // Impérial
  'in': 0.0254,
  'ft': 0.3048,
  'yd': 0.9144,
  'mi': 1609.344,
  
  // Astronomique
  'UA': 1.496e11,        // Unité astronomique
  'al': 9.461e15,        // Année-lumière
  'pc': 3.086e16,        // Parsec
  
  // Microscopique
  'nm': 1e-9,
  'μm': 1e-6,
  'Å': 1e-10,            // Angström
  'pm': 1e-12,
  'fm': 1e-15,
  
  // Constantes physiques
  'a₀': 5.292e-11,       // Rayon de Bohr
  'λC': 2.426e-12,       // Longueur d'onde Compton
  'lₚ': 1.616e-35,       // Longueur de Planck
};

// ========================================
// CONVERSIONS DE MASSE
// ========================================

export const MASS_CONVERSIONS = {
  // Métrique
  'kg': 1,
  'g': 0.001,
  'mg': 1e-6,
  'μg': 1e-9,
  'ng': 1e-12,
  
  // Impérial
  'lb': 0.453592,
  'oz': 0.0283495,
  'ton': 1000,           // Tonne métrique
  'ton_us': 907.185,     // Tonne courte US
  'ton_uk': 1016.05,     // Tonne longue UK
  
  // Atomique
  'u': 1.661e-27,        // Unité de masse atomique
  'Da': 1.661e-27,       // Dalton
  
  // Constantes physiques
  'mₑ': 9.109e-31,       // Masse de l'électron
  'mₚ': 1.673e-27,       // Masse du proton
  'mₙ': 1.675e-27,       // Masse du neutron
  'M☉': 1.989e30,        // Masse solaire
  'mₚ_planck': 2.176e-8, // Masse de Planck
};

// ========================================
// CONVERSIONS DE TEMPS
// ========================================

export const TIME_CONVERSIONS = {
  // Base
  's': 1,
  'ms': 0.001,
  'μs': 1e-6,
  'ns': 1e-9,
  'ps': 1e-12,
  'fs': 1e-15,
  
  // Plus grandes
  'min': 60,
  'h': 3600,
  'd': 86400,
  'wk': 604800,
  'yr': 31557600,        // Année julienne
  'yr_sidereal': 31558149.5, // Année sidérale
  
  // Constantes physiques
  'tₚ': 5.391e-44,       // Temps de Planck
};

// ========================================
// CONVERSIONS DE TEMPÉRATURE
// ========================================

export const TEMPERATURE_CONVERSIONS = {
  // Kelvin (référence)
  'K': 1,
  
  // Celsius
  '°C': {
    toKelvin: (celsius) => celsius + 273.15,
    fromKelvin: (kelvin) => kelvin - 273.15
  },
  
  // Fahrenheit
  '°F': {
    toKelvin: (fahrenheit) => (fahrenheit - 32) * 5/9 + 273.15,
    fromKelvin: (kelvin) => (kelvin - 273.15) * 9/5 + 32
  },
  
  // Rankine
  '°R': {
    toKelvin: (rankine) => rankine * 5/9,
    fromKelvin: (kelvin) => kelvin * 9/5
  }
};

// ========================================
// CONVERSIONS D'ÉNERGIE
// ========================================

export const ENERGY_CONVERSIONS = {
  // SI
  'J': 1,
  'kJ': 1000,
  'MJ': 1e6,
  'GJ': 1e9,
  'TJ': 1e12,
  
  // Électronvolt
  'eV': 1.602e-19,
  'keV': 1.602e-16,
  'MeV': 1.602e-13,
  'GeV': 1.602e-10,
  'TeV': 1.602e-7,
  
  // Thermique
  'cal': 4.184,
  'kcal': 4184,
  'BTU': 1055.06,
  
  // Électrique
  'Wh': 3600,
  'kWh': 3.6e6,
  'MWh': 3.6e9,
  
  // Atomique
  'Ry': 2.180e-18,       // Énergie de Rydberg
  'Hartree': 4.360e-18,  // Hartree (énergie atomique)
};

// ========================================
// CONVERSIONS DE PRESSION
// ========================================

export const PRESSURE_CONVERSIONS = {
  // SI
  'Pa': 1,
  'kPa': 1000,
  'MPa': 1e6,
  'GPa': 1e9,
  
  // Bar
  'bar': 100000,
  'mbar': 100,
  
  // Atmosphère
  'atm': 101325,
  'torr': 133.322,
  'mmHg': 133.322,
  
  // Impérial
  'psi': 6894.76,
  'psf': 47.8803,
  
  // Autres
  'Ba': 0.1,             // Barye (CGS)
};

// ========================================
// CONVERSIONS DE PUISSANCE
// ========================================

export const POWER_CONVERSIONS = {
  // SI
  'W': 1,
  'kW': 1000,
  'MW': 1e6,
  'GW': 1e9,
  'TW': 1e12,
  
  // Impérial
  'hp': 745.7,           // Cheval-vapeur
  'hp_metric': 735.499,  // Cheval-vapeur métrique
  
  // Autres
  'BTU/h': 0.293071,     // BTU par heure
};

// ========================================
// CONVERSIONS DE FORCE
// ========================================

export const FORCE_CONVERSIONS = {
  // SI
  'N': 1,
  'kN': 1000,
  'MN': 1e6,
  
  // Impérial
  'lbf': 4.44822,
  'lbm': 0.453592,       // Livre-masse (poids)
  
  // CGS
  'dyn': 1e-5,           // Dyne
};

// ========================================
// CONVERSIONS D'ANGLE
// ========================================

export const ANGLE_CONVERSIONS = {
  // Radian (référence)
  'rad': 1,
  
  // Degré
  'deg': {
    toRadian: (degrees) => degrees * Math.PI / 180,
    fromRadian: (radians) => radians * 180 / Math.PI
  },
  
  // Grade
  'grad': {
    toRadian: (gradians) => gradians * Math.PI / 200,
    fromRadian: (radians) => radians * 200 / Math.PI
  },
  
  // Autres
  'arcmin': {
    toRadian: (arcmin) => arcmin * Math.PI / 10800,
    fromRadian: (radians) => radians * 10800 / Math.PI
  },
  
  'arcsec': {
    toRadian: (arcsec) => arcsec * Math.PI / 648000,
    fromRadian: (radians) => radians * 648000 / Math.PI
  }
};

// ========================================
// CONVERSIONS DE FRÉQUENCE
// ========================================

export const FREQUENCY_CONVERSIONS = {
  // SI
  'Hz': 1,
  'kHz': 1000,
  'MHz': 1e6,
  'GHz': 1e9,
  'THz': 1e12,
  
  // Autres
  'rpm': 1/60,           // Tours par minute
  'rps': 1,              // Tours par seconde
};

// ========================================
// CONVERSIONS DE VITESSE
// ========================================

export const VELOCITY_CONVERSIONS = {
  // SI
  'm/s': 1,
  'km/h': 0.277778,
  'km/s': 1000,
  
  // Impérial
  'ft/s': 0.3048,
  'mph': 0.44704,
  'knot': 0.514444,
  
  // Autres
  'c': 299792458,        // Vitesse de la lumière
  'Mach': 343,           // Mach 1 (approximatif)
};

// ========================================
// CONVERSIONS DE VOLUME
// ========================================

export const VOLUME_CONVERSIONS = {
  // Métrique
  'm³': 1,
  'L': 0.001,
  'mL': 1e-6,
  'cm³': 1e-6,
  'mm³': 1e-9,
  
  // Impérial
  'gal': 0.00378541,     // Gallon US
  'qt': 0.000946353,     // Quart US
  'pt': 0.000473176,     // Pint US
  'cup': 0.000236588,    // Cup US
  'fl_oz': 2.95735e-5,   // Fluid ounce US
  
  // Autres
  'barrel': 0.158987,    // Baril de pétrole
};

// ========================================
// CONVERSIONS DE SURFACE
// ========================================

export const AREA_CONVERSIONS = {
  // Métrique
  'm²': 1,
  'cm²': 1e-4,
  'mm²': 1e-6,
  'km²': 1e6,
  'ha': 10000,           // Hectare
  
  // Impérial
  'in²': 6.4516e-4,
  'ft²': 0.092903,
  'yd²': 0.836127,
  'mi²': 2589988.11,
  
  // Autres
  'acre': 4046.86,       // Acre
};

// ========================================
// FONCTIONS DE CONVERSION
// ========================================

/**
 * Convertit une valeur d'une unité à une autre
 * @param {number} value - Valeur à convertir
 * @param {string} fromUnit - Unité source
 * @param {string} toUnit - Unité cible
 * @param {string} type - Type de conversion ('length', 'mass', 'time', etc.)
 * @returns {number} - Valeur convertie
 */
export function convertUnit(value, fromUnit, toUnit, type) {
  const conversionMap = {
    length: LENGTH_CONVERSIONS,
    mass: MASS_CONVERSIONS,
    time: TIME_CONVERSIONS,
    energy: ENERGY_CONVERSIONS,
    pressure: PRESSURE_CONVERSIONS,
    power: POWER_CONVERSIONS,
    force: FORCE_CONVERSIONS,
    frequency: FREQUENCY_CONVERSIONS,
    velocity: VELOCITY_CONVERSIONS,
    volume: VOLUME_CONVERSIONS,
    area: AREA_CONVERSIONS
  };

  const conversions = conversionMap[type];
  if (!conversions) {
    throw new Error(`Type de conversion non supporté: ${type}`);
  }

  // Gestion spéciale pour les températures
  if (type === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  // Gestion spéciale pour les angles
  if (type === 'angle') {
    return convertAngle(value, fromUnit, toUnit);
  }

  const fromFactor = conversions[fromUnit];
  const toFactor = conversions[toUnit];

  if (fromFactor === undefined || toFactor === undefined) {
    throw new Error(`Unité non supportée: ${fromUnit} ou ${toUnit}`);
  }

  // Conversion via mètre (ou unité de base)
  return (value * fromFactor) / toFactor;
}

/**
 * Convertit une température
 * @param {number} value - Valeur de température
 * @param {string} fromUnit - Unité source
 * @param {string} toUnit - Unité cible
 * @returns {number} - Température convertie
 */
export function convertTemperature(value, fromUnit, toUnit) {
  const conversions = TEMPERATURE_CONVERSIONS;
  
  let kelvin;
  
  // Conversion vers Kelvin
  if (fromUnit === 'K') {
    kelvin = value;
  } else if (conversions[fromUnit] && typeof conversions[fromUnit] === 'object') {
    kelvin = conversions[fromUnit].toKelvin(value);
  } else {
    throw new Error(`Unité de température non supportée: ${fromUnit}`);
  }
  
  // Conversion depuis Kelvin
  if (toUnit === 'K') {
    return kelvin;
  } else if (conversions[toUnit] && typeof conversions[toUnit] === 'object') {
    return conversions[toUnit].fromKelvin(kelvin);
  } else {
    throw new Error(`Unité de température non supportée: ${toUnit}`);
  }
}

/**
 * Convertit un angle
 * @param {number} value - Valeur d'angle
 * @param {string} fromUnit - Unité source
 * @param {string} toUnit - Unité cible
 * @returns {number} - Angle converti
 */
export function convertAngle(value, fromUnit, toUnit) {
  const conversions = ANGLE_CONVERSIONS;
  
  let radian;
  
  // Conversion vers radian
  if (fromUnit === 'rad') {
    radian = value;
  } else if (conversions[fromUnit] && typeof conversions[fromUnit] === 'object') {
    radian = conversions[fromUnit].toRadian(value);
  } else {
    throw new Error(`Unité d'angle non supportée: ${fromUnit}`);
  }
  
  // Conversion depuis radian
  if (toUnit === 'rad') {
    return radian;
  } else if (conversions[toUnit] && typeof conversions[toUnit] === 'object') {
    return conversions[toUnit].fromRadian(radian);
  } else {
    throw new Error(`Unité d'angle non supportée: ${toUnit}`);
  }
}

/**
 * Formate une valeur avec son unité
 * @param {number} value - Valeur numérique
 * @param {string} unit - Unité
 * @param {number} precision - Nombre de décimales (défaut: 3)
 * @returns {string} - Valeur formatée
 */
export function formatValue(value, unit, precision = 3) {
  if (Math.abs(value) < 1e-10) {
    return `0 ${unit}`;
  }
  
  if (Math.abs(value) >= 1e6 || Math.abs(value) <= 1e-3) {
    return `${value.toExponential(precision)} ${unit}`;
  }
  
  return `${value.toFixed(precision)} ${unit}`;
}

/**
 * Obtient toutes les unités disponibles pour un type
 * @param {string} type - Type de conversion
 * @returns {Array} - Liste des unités
 */
export function getAvailableUnits(type) {
  const conversionMap = {
    length: LENGTH_CONVERSIONS,
    mass: MASS_CONVERSIONS,
    time: TIME_CONVERSIONS,
    energy: ENERGY_CONVERSIONS,
    pressure: PRESSURE_CONVERSIONS,
    power: POWER_CONVERSIONS,
    force: FORCE_CONVERSIONS,
    frequency: FREQUENCY_CONVERSIONS,
    velocity: VELOCITY_CONVERSIONS,
    volume: VOLUME_CONVERSIONS,
    area: AREA_CONVERSIONS,
    temperature: TEMPERATURE_CONVERSIONS,
    angle: ANGLE_CONVERSIONS
  };

  const conversions = conversionMap[type];
  if (!conversions) {
    return [];
  }

  return Object.keys(conversions);
}

/**
 * Détecte automatiquement le type d'unité
 * @param {string} unit - Unité à analyser
 * @returns {string|null} - Type détecté ou null
 */
export function detectUnitType(unit) {
  const unitPatterns = {
    length: ['m', 'mm', 'cm', 'km', 'in', 'ft', 'mi', 'UA', 'al', 'pc', 'nm', 'μm', 'Å'],
    mass: ['kg', 'g', 'mg', 'lb', 'oz', 'ton', 'u', 'Da', 'mₑ', 'mₚ'],
    time: ['s', 'ms', 'min', 'h', 'd', 'yr'],
    energy: ['J', 'eV', 'keV', 'MeV', 'cal', 'BTU', 'Wh'],
    pressure: ['Pa', 'bar', 'atm', 'psi', 'torr'],
    power: ['W', 'kW', 'MW', 'hp'],
    force: ['N', 'kN', 'lbf'],
    frequency: ['Hz', 'kHz', 'MHz', 'GHz'],
    velocity: ['m/s', 'km/h', 'mph', 'c'],
    volume: ['m³', 'L', 'mL', 'gal'],
    area: ['m²', 'cm²', 'km²', 'ha', 'ft²'],
    temperature: ['K', '°C', '°F', '°R'],
    angle: ['rad', 'deg', 'grad', 'arcmin', 'arcsec']
  };

  for (const [type, units] of Object.entries(unitPatterns)) {
    if (units.includes(unit)) {
      return type;
    }
  }

  return null;
}

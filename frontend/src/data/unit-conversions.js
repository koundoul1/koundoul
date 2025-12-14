/**
 * 🔄 CONVERSIONS D'UNITÉS - KOUNDOUL
 * Système complet de conversion d'unités pour la résolution de problèmes
 */

// ========================================
// FACTEURS DE CONVERSION
// ========================================

export const CONVERSION_FACTORS = {
  // Longueur
  length: {
    // Unités métriques
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    micrometer: 1e-6,
    nanometer: 1e-9,
    
    // Unités impériales
    inch: 0.0254,
    foot: 0.3048,
    yard: 0.9144,
    mile: 1609.344,
    
    // Unités astronomiques
    astronomical_unit: 1.496e11,
    light_year: 9.461e15,
    parsec: 3.086e16
  },

  // Masse
  mass: {
    // Unités métriques
    kilogram: 1,
    gram: 0.001,
    milligram: 1e-6,
    metric_ton: 1000,
    
    // Unités impériales
    pound: 0.453592,
    ounce: 0.0283495,
    stone: 6.35029,
    
    // Unités atomiques
    atomic_mass_unit: 1.661e-27,
    electron_mass: 9.109e-31,
    proton_mass: 1.673e-27,
    neutron_mass: 1.675e-27
  },

  // Temps
  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    year: 31536000,
    millennium: 31536000000
  },

  // Température
  temperature: {
    celsius: {
      toKelvin: (c) => c + 273.15,
      toFahrenheit: (c) => c * 9/5 + 32,
      fromKelvin: (k) => k - 273.15,
      fromFahrenheit: (f) => (f - 32) * 5/9
    },
    fahrenheit: {
      toKelvin: (f) => (f - 32) * 5/9 + 273.15,
      toCelsius: (f) => (f - 32) * 5/9,
      fromKelvin: (k) => (k - 273.15) * 9/5 + 32,
      fromCelsius: (c) => c * 9/5 + 32
    },
    kelvin: {
      toCelsius: (k) => k - 273.15,
      toFahrenheit: (k) => (k - 273.15) * 9/5 + 32,
      fromCelsius: (c) => c + 273.15,
      fromFahrenheit: (f) => (f - 32) * 5/9 + 273.15
    }
  },

  // Énergie
  energy: {
    joule: 1,
    kilojoule: 1000,
    megajoule: 1e6,
    gigajoule: 1e9,
    electronvolt: 1.602e-19,
    kiloelectronvolt: 1.602e-16,
    megaelectronvolt: 1.602e-13,
    gigaelectronvolt: 1.602e-10,
    calorie: 4.184,
    kilocalorie: 4184,
    british_thermal_unit: 1055.06,
    kilowatt_hour: 3.6e6
  },

  // Puissance
  power: {
    watt: 1,
    kilowatt: 1000,
    megawatt: 1e6,
    gigawatt: 1e9,
    horsepower: 745.7,
    foot_pound_per_second: 1.356
  },

  // Pression
  pressure: {
    pascal: 1,
    kilopascal: 1000,
    megapascal: 1e6,
    gigapascal: 1e9,
    atmosphere: 101325,
    bar: 100000,
    millibar: 100,
    torr: 133.322,
    millimeter_mercury: 133.322,
    inch_mercury: 3386.39,
    pound_per_square_inch: 6894.76
  },

  // Volume
  volume: {
    // Unités métriques
    cubic_meter: 1,
    liter: 0.001,
    milliliter: 1e-6,
    cubic_centimeter: 1e-6,
    cubic_decimeter: 0.001,
    
    // Unités impériales
    gallon_us: 0.00378541,
    gallon_uk: 0.00454609,
    quart: 0.000946353,
    pint: 0.000473176,
    cup: 0.000236588,
    fluid_ounce: 0.0000295735,
    cubic_inch: 1.63871e-5,
    cubic_foot: 0.0283168
  },

  // Surface
  area: {
    square_meter: 1,
    square_kilometer: 1e6,
    square_centimeter: 1e-4,
    square_millimeter: 1e-6,
    hectare: 10000,
    acre: 4046.86,
    square_foot: 0.092903,
    square_inch: 6.4516e-4,
    square_yard: 0.836127,
    square_mile: 2589988
  },

  // Vitesse
  velocity: {
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    mile_per_hour: 0.44704,
    foot_per_second: 0.3048,
    knot: 0.514444,
    mach: 343, // Vitesse du son à 20°C
    speed_of_light: 299792458
  },

  // Accélération
  acceleration: {
    meter_per_second_squared: 1,
    kilometer_per_hour_squared: 7.71605e-5,
    mile_per_hour_squared: 0.000124274,
    foot_per_second_squared: 0.3048,
    inch_per_second_squared: 0.0254,
    gravity: 9.80665 // g
  },

  // Force
  force: {
    newton: 1,
    kilonewton: 1000,
    meganewton: 1e6,
    dyne: 1e-5,
    pound_force: 4.44822,
    kilogram_force: 9.80665,
    ounce_force: 0.278014
  },

  // Fréquence
  frequency: {
    hertz: 1,
    kilohertz: 1000,
    megahertz: 1e6,
    gigahertz: 1e9,
    terahertz: 1e12,
    revolutions_per_minute: 0.0166667,
    radians_per_second: 0.159155
  },

  // Angle
  angle: {
    radian: 1,
    degree: 0.0174533,
    gradian: 0.015708,
    minute: 0.000290888,
    second: 4.84814e-6,
    revolution: 6.28319
  }
};

// ========================================
// FONCTIONS DE CONVERSION
// ========================================

/**
 * Convertit une valeur d'une unité à une autre
 * @param {number} value - Valeur à convertir
 * @param {string} fromUnit - Unité source
 * @param {string} toUnit - Unité cible
 * @returns {number} - Valeur convertie
 */
export function convertUnit(value, fromUnit, toUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('La valeur doit être un nombre valide');
  }

  // Gestion spéciale pour la température
  if (fromUnit.includes('celsius') || fromUnit.includes('fahrenheit') || fromUnit.includes('kelvin')) {
    return convertTemperature(value, fromUnit, toUnit);
  }

  // Trouver le type d'unité
  const fromType = detectUnitType(fromUnit);
  const toType = detectUnitType(toUnit);

  if (!fromType || !toType) {
    throw new Error(`Unités non reconnues: ${fromUnit} ou ${toUnit}`);
  }

  if (fromType !== toType) {
    throw new Error(`Impossible de convertir entre ${fromType} et ${toType}`);
  }

  const factors = CONVERSION_FACTORS[fromType];
  if (!factors || !factors[fromUnit] || !factors[toUnit]) {
    throw new Error(`Facteurs de conversion non trouvés pour ${fromUnit} vers ${toUnit}`);
  }

  // Conversion: valeur * (facteur_source / facteur_cible)
  return value * (factors[fromUnit] / factors[toUnit]);
}

/**
 * Convertit une température d'une unité à une autre
 * @param {number} value - Valeur de température
 * @param {string} fromUnit - Unité source
 * @param {string} toUnit - Unité cible
 * @returns {number} - Température convertie
 */
export function convertTemperature(value, fromUnit, toUnit) {
  const tempFactors = CONVERSION_FACTORS.temperature;
  
  let celsiusValue;
  
  // Convertir vers Celsius
  if (fromUnit.includes('celsius')) {
    celsiusValue = value;
  } else if (fromUnit.includes('fahrenheit')) {
    celsiusValue = tempFactors.fahrenheit.toCelsius(value);
  } else if (fromUnit.includes('kelvin')) {
    celsiusValue = tempFactors.kelvin.toCelsius(value);
  } else {
    throw new Error(`Unité de température source non reconnue: ${fromUnit}`);
  }

  // Convertir depuis Celsius
  if (toUnit.includes('celsius')) {
    return celsiusValue;
  } else if (toUnit.includes('fahrenheit')) {
    return tempFactors.celsius.toFahrenheit(celsiusValue);
  } else if (toUnit.includes('kelvin')) {
    return tempFactors.celsius.toKelvin(celsiusValue);
  } else {
    throw new Error(`Unité de température cible non reconnue: ${toUnit}`);
  }
}

/**
 * Détecte le type d'unité d'une chaîne
 * @param {string} unit - Unité à analyser
 * @returns {string|null} - Type d'unité ou null
 */
export function detectUnitType(unit) {
  const normalizedUnit = unit.toLowerCase().replace(/[^a-z]/g, '');
  
  // Recherche dans chaque catégorie
  for (const [type, factors] of Object.entries(CONVERSION_FACTORS)) {
    if (type === 'temperature') continue; // Géré séparément
    
    for (const factorUnit of Object.keys(factors)) {
      if (normalizedUnit === factorUnit.toLowerCase().replace(/[^a-z]/g, '') ||
          normalizedUnit.includes(factorUnit.toLowerCase().replace(/[^a-z]/g, ''))) {
        return type;
      }
    }
  }

  // Vérification spéciale pour la température
  if (unit.includes('celsius') || unit.includes('fahrenheit') || unit.includes('kelvin')) {
    return 'temperature';
  }

  return null;
}

/**
 * Obtient toutes les unités disponibles pour un type donné
 * @param {string} type - Type d'unité
 * @returns {Array} - Liste des unités disponibles
 */
export function getUnitsForType(type) {
  if (type === 'temperature') {
    return ['celsius', 'fahrenheit', 'kelvin'];
  }
  
  return Object.keys(CONVERSION_FACTORS[type] || {});
}

/**
 * Obtient tous les types d'unités disponibles
 * @returns {Array} - Liste des types d'unités
 */
export function getAllUnitTypes() {
  return Object.keys(CONVERSION_FACTORS);
}

/**
 * Formate une valeur avec des unités pour l'affichage
 * @param {number} value - Valeur à formater
 * @param {string} unit - Unité
 * @param {number} precision - Nombre de décimales (défaut: 6)
 * @returns {string} - Valeur formatée
 */
export function formatValue(value, unit, precision = 6) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Valeur invalide';
  }

  // Formatage scientifique pour les très petits ou très grands nombres
  if (Math.abs(value) < 1e-6 || Math.abs(value) > 1e6) {
    return `${value.toExponential(precision)} ${unit}`;
  }

  // Formatage décimal normal
  return `${value.toFixed(precision)} ${unit}`;
}

/**
 * Obtient les unités les plus couramment utilisées
 * @param {string} type - Type d'unité (optionnel)
 * @returns {Object} - Objet avec les unités communes par type
 */
export function getCommonUnits(type = null) {
  const commonUnits = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'foot', 'mile'],
    mass: ['kilogram', 'gram', 'pound', 'ounce'],
    time: ['second', 'minute', 'hour', 'day', 'year'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    energy: ['joule', 'kilojoule', 'electronvolt', 'calorie', 'kilowatt_hour'],
    power: ['watt', 'kilowatt', 'megawatt', 'horsepower'],
    pressure: ['pascal', 'kilopascal', 'atmosphere', 'bar', 'pound_per_square_inch'],
    volume: ['cubic_meter', 'liter', 'milliliter', 'gallon_us', 'gallon_uk'],
    area: ['square_meter', 'square_kilometer', 'square_centimeter', 'hectare', 'acre'],
    velocity: ['meter_per_second', 'kilometer_per_hour', 'mile_per_hour', 'knot'],
    acceleration: ['meter_per_second_squared', 'gravity'],
    force: ['newton', 'kilonewton', 'pound_force'],
    frequency: ['hertz', 'kilohertz', 'megahertz', 'gigahertz'],
    angle: ['radian', 'degree', 'gradian']
  };

  if (type) {
    return commonUnits[type] || [];
  }

  return commonUnits;
}

/**
 * Valide si une unité est reconnue
 * @param {string} unit - Unité à valider
 * @returns {boolean} - True si l'unité est reconnue
 */
export function isValidUnit(unit) {
  return detectUnitType(unit) !== null;
}

/**
 * Obtient des suggestions d'unités similaires
 * @param {string} unit - Unité de référence
 * @param {number} limit - Nombre maximum de suggestions (défaut: 5)
 * @returns {Array} - Liste des unités similaires
 */
export function getSimilarUnits(unit, limit = 5) {
  const type = detectUnitType(unit);
  if (!type) return [];

  const allUnits = getUnitsForType(type);
  const normalizedInput = unit.toLowerCase();
  
  return allUnits
    .filter(u => u !== unit && u.toLowerCase().includes(normalizedInput))
    .slice(0, limit);
}

/**
 * 🔬 ROUTES POUR LES CONSTANTES PHYSIQUES - KOUNDOUL
 * API pour accéder aux constantes et formules
 */

import express from 'express';
import { 
  ALL_PHYSICS_CONSTANTS, 
  findConstantBySymbol, 
  findConstantsByCategory,
  findConstantsByDescription,
  getAllCategories,
  getEssentialConstants
} from '../constants/physics-constants.js';
import { 
  convertUnit, 
  detectUnitType, 
  formatValue, 
  getAvailableUnits 
} from '../constants/unit-conversions.js';
import { 
  ALL_FORMULAS, 
  findFormulas, 
  findFormulasByCategory,
  getAllFormulaCategories 
} from '../constants/formulas.js';

const router = express.Router();

// ========================================
// CONSTANTES PHYSIQUES
// ========================================

/**
 * GET /api/constants
 * Récupérer toutes les constantes physiques
 */
router.get('/', (req, res) => {
  try {
    const { category, symbol, search } = req.query;
    
    let constants = Object.values(ALL_PHYSICS_CONSTANTS);
    
    // Filtrer par catégorie
    if (category) {
      constants = findConstantsByCategory(category);
    }
    
    // Rechercher par symbole
    if (symbol) {
      const constant = findConstantBySymbol(symbol);
      constants = constant ? [constant] : [];
    }
    
    // Rechercher par description
    if (search) {
      constants = findConstantsByDescription(search);
    }
    
    res.json({
      success: true,
      data: {
        constants,
        total: constants.length,
        categories: getAllCategories()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des constantes',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/essential
 * Récupérer les constantes essentielles
 */
router.get('/essential', (req, res) => {
  try {
    const essentialConstants = getEssentialConstants();
    
    res.json({
      success: true,
      data: {
        constants: essentialConstants,
        total: essentialConstants.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des constantes essentielles',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/categories
 * Récupérer toutes les catégories de constantes
 */
router.get('/categories', (req, res) => {
  try {
    const categories = getAllCategories();
    
    res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/:symbol
 * Récupérer une constante par son symbole
 */
router.get('/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const constant = findConstantBySymbol(symbol);
    
    if (!constant) {
      return res.status(404).json({
        success: false,
        message: `Constante avec le symbole '${symbol}' non trouvée`
      });
    }
    
    res.json({
      success: true,
      data: constant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la constante',
      error: error.message
    });
  }
});

// ========================================
// CONVERSIONS D'UNITÉS
// ========================================

/**
 * POST /api/constants/convert
 * Convertir une valeur d'une unité à une autre
 */
router.post('/convert', (req, res) => {
  try {
    const { value, fromUnit, toUnit, type } = req.body;
    
    if (!value || !fromUnit || !toUnit || !type) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: value, fromUnit, toUnit, type'
      });
    }
    
    const convertedValue = convertUnit(parseFloat(value), fromUnit, toUnit, type);
    
    res.json({
      success: true,
      data: {
        originalValue: formatValue(parseFloat(value), fromUnit),
        convertedValue: formatValue(convertedValue, toUnit),
        conversion: `${value} ${fromUnit} = ${convertedValue.toFixed(6)} ${toUnit}`
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la conversion',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/units/:type
 * Récupérer les unités disponibles pour un type de conversion
 */
router.get('/units/:type', (req, res) => {
  try {
    const { type } = req.params;
    const units = getAvailableUnits(type);
    
    if (units.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Type de conversion '${type}' non supporté`
      });
    }
    
    res.json({
      success: true,
      data: {
        type,
        units,
        total: units.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des unités',
      error: error.message
    });
  }
});

/**
 * POST /api/constants/detect-unit-type
 * Détecter automatiquement le type d'unité
 */
router.post('/detect-unit-type', (req, res) => {
  try {
    const { unit } = req.body;
    
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: 'Paramètre unit manquant'
      });
    }
    
    const unitType = detectUnitType(unit);
    
    res.json({
      success: true,
      data: {
        unit,
        type: unitType,
        availableUnits: unitType ? getAvailableUnits(unitType) : []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la détection du type d\'unité',
      error: error.message
    });
  }
});

// ========================================
// FORMULES
// ========================================

/**
 * GET /api/constants/formulas
 * Récupérer toutes les formules
 */
router.get('/formulas', (req, res) => {
  try {
    const { category, search } = req.query;
    
    let formulas = Object.entries(ALL_FORMULAS).map(([key, formula]) => ({
      key,
      ...formula
    }));
    
    // Filtrer par catégorie
    if (category) {
      const categoryFormulas = findFormulasByCategory(category);
      formulas = categoryFormulas.map(([key, formula]) => ({
        key,
        ...formula
      }));
    }
    
    // Rechercher par mot-clé
    if (search) {
      const searchResults = findFormulas(search);
      formulas = searchResults.map(([key, formula]) => ({
        key,
        ...formula
      }));
    }
    
    res.json({
      success: true,
      data: {
        formulas,
        total: formulas.length,
        categories: getAllFormulaCategories()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formules',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/formulas/categories
 * Récupérer toutes les catégories de formules
 */
router.get('/formulas/categories', (req, res) => {
  try {
    const categories = getAllFormulaCategories();
    
    res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories de formules',
      error: error.message
    });
  }
});

/**
 * GET /api/constants/formulas/:key
 * Récupérer une formule par sa clé
 */
router.get('/formulas/:key', (req, res) => {
  try {
    const { key } = req.params;
    const formula = ALL_FORMULAS[key];
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: `Formule avec la clé '${key}' non trouvée`
      });
    }
    
    res.json({
      success: true,
      data: {
        key,
        ...formula
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la formule',
      error: error.message
    });
  }
});

export default router;

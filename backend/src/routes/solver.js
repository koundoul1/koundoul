const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

// SolverHistory model doesn't exist in database yet.
// /solve returns solution without saving; history routes return empty arrays.

router.post('/solve', authenticateToken, async (req, res, next) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problème requis' });
    }

    const solution = {
      steps: [
        { step: 1, description: 'Analyser le problème', content: 'Identifier les données connues et inconnues du problème.' },
        { step: 2, description: 'Appliquer la méthode appropriée', content: 'Utiliser les formules et méthodes adaptées à ce type de problème.' },
        { step: 3, description: 'Résoudre étape par étape', content: 'Effectuer les calculs nécessaires de manière progressive.' },
        { step: 4, description: 'Vérifier la solution', content: 'S\'assurer que la réponse est cohérente et complète.' }
      ],
      answer: 'Solution à calculer avec l\'IA',
      explanation: 'Explication détaillée de la méthode utilisée et des étapes de résolution.'
    };

    res.json({ success: true, data: solution });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticateToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/problems', authenticateToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/problems', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'La sauvegarde de problèmes n\'est pas encore disponible' });
});

module.exports = router;

/**
 * ⚔️ Contrôleur Duels - KOUNDOUL
 * Gestion des endpoints pour les duels
 */

import duelsService from './duels.service.js';

class DuelsController {
  /**
   * GET /api/duels
   * Récupérer les duels disponibles pour l'utilisateur
   */
  async getDuels(req, res) {
    try {
      const userId = req.user.userId;
      const { public: isPublic } = req.query;

      let duels;
      if (isPublic === 'true') {
        duels = await duelsService.getPublicDuels(userId, req.query);
      } else {
        duels = await duelsService.getAvailableDuels(userId);
      }

      res.json({
        success: true,
        data: duels
      });
    } catch (error) {
      console.error('❌ Get duels error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * POST /api/duels
   * Créer un nouveau duel
   */
  async createDuel(req, res) {
    try {
      const challengerId = req.user.userId;
      const { opponentId, subjectId, difficulty, questions, timeLimit } = req.body;

      const duel = await duelsService.createDuel(challengerId, {
        opponentId,
        subjectId,
        difficulty,
        questions,
        timeLimit
      });

      res.json({
        success: true,
        data: duel,
        message: 'Duel créé avec succès'
      });
    } catch (error) {
      console.error('❌ Create duel error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * POST /api/duels/:id/accept
   * Accepter un duel
   */
  async acceptDuel(req, res) {
    try {
      const { id } = req.params;
      const opponentId = req.user.userId;

      const duel = await duelsService.acceptDuel(id, opponentId);

      res.json({
        success: true,
        data: duel,
        message: 'Duel accepté avec succès'
      });
    } catch (error) {
      console.error('❌ Accept duel error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * POST /api/duels/:id/start
   * Démarrer un duel
   */
  async startDuel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await duelsService.startDuel(id, userId);

      res.json({
        success: true,
        data: result,
        message: 'Duel démarré avec succès'
      });
    } catch (error) {
      console.error('❌ Start duel error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * POST /api/duels/:id/submit
   * Soumettre les résultats d'un duel
   */
  async submitDuel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { quizAttemptId, score } = req.body;

      if (!quizAttemptId || score === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'Données manquantes' }
        });
      }

      const duel = await duelsService.submitDuel(id, userId, quizAttemptId, score);

      res.json({
        success: true,
        data: duel,
        message: duel.status === 'COMPLETED' 
          ? (duel.winnerId === userId ? 'Félicitations, vous avez gagné !' : 'Duel terminé')
          : 'Résultats enregistrés, en attente de votre adversaire'
      });
    } catch (error) {
      console.error('❌ Submit duel error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * GET /api/duels/history
   * Récupérer l'historique des duels
   */
  async getDuelHistory(req, res) {
    try {
      const userId = req.user.userId;
      const history = await duelsService.getDuelHistory(userId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('❌ Get duel history error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new DuelsController();








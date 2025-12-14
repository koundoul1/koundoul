/**
 * 🏆 Contrôleur Challenges - KOUNDOUL
 * Gestion des endpoints pour les challenges
 */

import challengesService from './challenges.service.js';

class ChallengesController {
  /**
   * GET /api/challenges
   * Récupérer tous les challenges actifs
   */
  async getChallenges(req, res) {
    try {
      const challenges = await challengesService.getActiveChallenges();

      res.json({
        success: true,
        data: challenges
      });
    } catch (error) {
      console.error('❌ Get challenges error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * GET /api/challenges/weekly
   * Récupérer le challenge hebdomadaire actif
   */
  async getWeeklyChallenge(req, res) {
    try {
      const challenge = await challengesService.getWeeklyChallenge();

      if (!challenge) {
        return res.json({
          success: true,
          data: null,
          message: 'Aucun challenge hebdomadaire actif pour le moment'
        });
      }

      res.json({
        success: true,
        data: challenge
      });
    } catch (error) {
      console.error('❌ Get weekly challenge error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * GET /api/challenges/:id
   * Récupérer un challenge par ID
   */
  async getChallenge(req, res) {
    try {
      const { id } = req.params;
      const challenge = await challengesService.getChallengeById(id);

      res.json({
        success: true,
        data: challenge
      });
    } catch (error) {
      console.error('❌ Get challenge error:', error);
      res.status(404).json({
        success: false,
        error: { message: error.message || 'Challenge non trouvé' }
      });
    }
  }

  /**
   * POST /api/challenges/:id/start
   * Démarrer un challenge
   */
  async startChallenge(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await challengesService.startChallenge(id, userId);

      res.json({
        success: true,
        data: {
          challenge: result.challenge,
          quiz: result.quiz,
          participant: result.participant
        },
        message: 'Challenge démarré avec succès'
      });
    } catch (error) {
      console.error('❌ Start challenge error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * POST /api/challenges/:id/submit
   * Soumettre les réponses d'un challenge
   */
  async submitChallenge(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { quizAttemptId, score, correctAnswers, timeSpent } = req.body;

      if (!quizAttemptId || score === undefined) {
        return res.status(400).json({
          success: false,
          error: { message: 'Données manquantes' }
        });
      }

      const participant = await challengesService.submitChallenge(
        id,
        userId,
        quizAttemptId,
        score,
        correctAnswers || 0,
        timeSpent || 0
      );

      res.json({
        success: true,
        data: participant,
        message: 'Challenge complété avec succès !'
      });
    } catch (error) {
      console.error('❌ Submit challenge error:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * GET /api/challenges/:id/leaderboard
   * Récupérer le classement d'un challenge
   */
  async getLeaderboard(req, res) {
    try {
      const { id } = req.params;
      const { scope = 'international' } = req.query;

      const leaderboard = await challengesService.getLeaderboard(id, scope);

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('❌ Get leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  /**
   * GET /api/challenges/:id/rank
   * Récupérer la position de l'utilisateur dans le classement
   */
  async getUserRank(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { scope = 'international' } = req.query;

      const rank = await challengesService.getUserRank(id, userId, scope);

      if (!rank) {
        return res.json({
          success: true,
          data: null,
          message: 'Vous n\'avez pas encore complété ce challenge'
        });
      }

      res.json({
        success: true,
        data: rank
      });
    } catch (error) {
      console.error('❌ Get user rank error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new ChallengesController();








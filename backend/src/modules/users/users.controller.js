/**
 * 👤 Users Controller - KOUNDOUL
 * Contrôleur pour les fonctionnalités utilisateur
 */

class UsersController {
  /**
   * Récupère le profil utilisateur (stub pour sync langue)
   */
  async getProfile(req, res) {
    try {
      // Stub pour éviter les erreurs 404/400 de sync langue
      const profile = {
        id: req.user?.id || 'guest',
        language: 'fr',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erreur getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      });
    }
  }

  /**
   * Met à jour le profil utilisateur (stub pour sync langue)
   */
  async updateProfile(req, res) {
    try {
      const { language, preferences } = req.body;
      
      // Stub - en réalité on sauvegarderait en DB
      console.log('📝 Profile update:', { language, preferences });

      res.json({
        success: true,
        data: {
          id: req.user?.id || 'guest',
          language: language || 'fr',
          preferences: preferences || {}
        }
      });
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil',
        error: error.message
      });
    }
  }
}

export default new UsersController();
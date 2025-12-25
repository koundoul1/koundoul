import adminService from './admin.service.js';

class AdminController {
  /**
   * GET /api/admin/dashboard
   * Obtenir les statistiques du dashboard admin
   */
  async getDashboard(req, res) {
    try {
      const result = await adminService.getDashboardStats();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getDashboard controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/admin/users
   * Obtenir tous les utilisateurs (avec pagination)
   */
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || '';

      const result = await adminService.getUsers(page, limit, search);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getUsers controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/admin/subscriptions
   * Obtenir tous les abonnements
   */
  async getSubscriptions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;

      const result = await adminService.getSubscriptions(page, limit, status);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getSubscriptions controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * GET /api/admin/payments
   * Obtenir tous les paiements
   */
  async getPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;

      const result = await adminService.getPayments(page, limit, status);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in getPayments controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id
   * Mettre à jour le statut d'un utilisateur
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { isActive, isAdmin } = req.body;

      const updateData = {};
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Aucune donnée à mettre à jour' }
        });
      }

      const result = await adminService.updateUserStatus(id, updateData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.error }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error in updateUser controller:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  }
}

export default new AdminController();

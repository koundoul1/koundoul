import dashboardService from './dashboard.service.js';

class DashboardController {
  
  async getDashboard(req, res) {
    try {
      const userId = req.user.userId;
      const dashboard = await dashboardService.getUserDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new DashboardController();



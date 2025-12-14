import badgesService from './badges.service.js';

class BadgesController {
  
  // GET /api/badges
  async getUserBadges(req, res) {
    try {
      const userId = req.user.userId;
      const badges = await badgesService.getUserBadges(userId);

      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      console.error('❌ Get badges error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/badges/all
  async getAllBadges(req, res) {
    try {
      const userId = req.user.userId;
      const badges = await badgesService.getAllBadgesWithStatus(userId);

      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      console.error('❌ Get all badges error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/badges/check
  async checkBadges(req, res) {
    try {
      const userId = req.user.userId;
      const newBadges = await badgesService.checkAndUnlockBadges(userId);

      res.json({
        success: true,
        data: newBadges,
        message: newBadges.length > 0 
          ? `🎉 ${newBadges.length} nouveau(x) badge(s) débloqué(s) !`
          : 'Aucun nouveau badge'
      });
    } catch (error) {
      console.error('❌ Check badges error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/badges/stats
  async getBadgeStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await badgesService.getBadgeStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Get badge stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new BadgesController();



import microlessonsService from './microlessons.service.js'

class MicrolessonsController {
  async list(req, res) {
    try {
      const { level, subject, difficulty, q, limit, offset } = req.query
      const data = await microlessonsService.search({ level, subject, difficulty, q, limit, offset })
      res.json({ success: true, data })
    } catch (error) {
      console.error('❌ Microlessons list:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params
      const data = await microlessonsService.getById(id)
      if (!data) return res.status(404).json({ success: false, error: { message: 'Leçon non trouvée' } })
      res.json({ success: true, data })
    } catch (error) {
      console.error('❌ Microlesson get:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async chapterPath(req, res) {
    try {
      const { chapter, level } = req.query
      const data = await microlessonsService.getChapterPath(chapter, level)
      res.json({ success: true, data })
    } catch (error) {
      console.error('❌ Microlessons chapter path:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  // ===== TRACKING ENDPOINTS =====

  async complete(req, res) {
    try {
      const { id } = req.params
      const userId = req.user?.id
      const { score, timeSpent } = req.body

      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Non authentifié' } })
      }

      const completion = await microlessonsService.completeLesson(userId, id, { score, timeSpent })
      
      // Calculer XP gagné
      const lesson = await microlessonsService.getById(id)
      const xpEarned = (score >= 80 && lesson?.xp_reward) ? lesson.xp_reward : 0

      res.json({ 
        success: true, 
        data: { completion, xpEarned } 
      })
    } catch (error) {
      console.error('❌ Microlesson complete:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async getCompletion(req, res) {
    try {
      const { id } = req.params
      const userId = req.user?.id

      // Si pas d'utilisateur authentifié, retourner null (pas d'erreur)
      if (!userId) {
        return res.json({ success: true, data: null })
      }

      const completion = await microlessonsService.getCompletionStatus(userId, id)
      res.json({ success: true, data: completion })
    } catch (error) {
      console.error('❌ Microlesson completion:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async myStats(req, res) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Non authentifié' } })
      }

      const stats = await microlessonsService.getUserStats(userId)
      res.json({ success: true, data: stats })
    } catch (error) {
      console.error('❌ Microlessons stats:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }

  async toReview(req, res) {
    try {
      const userId = req.user?.id
      const { limit } = req.query

      if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Non authentifié' } })
      }

      const lessons = await microlessonsService.getToReview(userId, parseInt(limit) || 10)
      res.json({ success: true, data: lessons })
    } catch (error) {
      console.error('❌ Microlessons to review:', error)
      res.status(500).json({ success: false, error: { message: error.message } })
    }
  }
}

export default new MicrolessonsController()



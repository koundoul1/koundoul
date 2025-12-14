import forumService from './forum.service.js';

class ForumController {
  
  // GET /forum - Liste des discussions
  async getDiscussions(req, res) {
    try {
      const filters = {
        category: req.query.category,
        subjectId: req.query.subjectId,
        lessonId: req.query.lessonId,
        solved: req.query.solved,
        search: req.query.search
      };
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await forumService.getDiscussions(filters, page, limit);
      
      res.json({
        success: true,
        data: result.discussions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Get discussions error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // GET /forum/:id - Détail d'une discussion
  async getDiscussion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      const discussion = await forumService.getDiscussionById(id, userId);
      
      res.json({
        success: true,
        data: discussion
      });
    } catch (error) {
      console.error('❌ Get discussion error:', error);
      res.status(404).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /forum - Créer une discussion
  async createDiscussion(req, res) {
    try {
      const userId = req.user.userId;
      const { title, content, category, lessonId, exerciseId, subjectId } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: { message: 'Title et content sont requis' }
        });
      }
      
      const discussion = await forumService.createDiscussion(userId, {
        title,
        content,
        category,
        lessonId,
        exerciseId,
        subjectId
      });
      
      res.json({
        success: true,
        data: discussion,
        message: 'Discussion créée avec succès'
      });
    } catch (error) {
      console.error('❌ Create discussion error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /forum/:id/reply - Ajouter une réponse
  async createReply(req, res) {
    try {
      const userId = req.user.userId;
      const { id: discussionId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: { message: 'Content est requis' }
        });
      }
      
      const reply = await forumService.createReply(userId, discussionId, content);
      
      res.json({
        success: true,
        data: reply,
        message: 'Réponse ajoutée avec succès'
      });
    } catch (error) {
      console.error('❌ Create reply error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /forum/:id/vote - Voter pour une discussion
  async voteDiscussion(req, res) {
    try {
      const userId = req.user.userId;
      const { id: discussionId } = req.params;
      const { value } = req.body; // +1 ou -1
      
      const result = await forumService.voteDiscussion(userId, discussionId, parseInt(value));
      
      res.json({
        success: true,
        data: result,
        message: 'Vote enregistré'
      });
    } catch (error) {
      console.error('❌ Vote discussion error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /forum/reply/:replyId/vote - Voter pour une réponse
  async voteReply(req, res) {
    try {
      const userId = req.user.userId;
      const { replyId } = req.params;
      const { value } = req.body;
      
      const result = await forumService.voteReply(userId, replyId, parseInt(value));
      
      res.json({
        success: true,
        data: result,
        message: 'Vote enregistré'
      });
    } catch (error) {
      console.error('❌ Vote reply error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // POST /forum/:id/best-answer/:replyId - Marquer meilleure réponse
  async markBestAnswer(req, res) {
    try {
      const userId = req.user.userId;
      const { id: discussionId, replyId } = req.params;
      
      const reply = await forumService.markBestAnswer(userId, discussionId, replyId);
      
      res.json({
        success: true,
        data: reply,
        message: 'Meilleure réponse marquée'
      });
    } catch (error) {
      console.error('❌ Mark best answer error:', error);
      res.status(403).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // GET /forum/user/discussions - Discussions de l'utilisateur
  async getUserDiscussions(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 10;
      
      const discussions = await forumService.getUserDiscussions(userId, limit);
      
      res.json({
        success: true,
        data: discussions
      });
    } catch (error) {
      console.error('❌ Get user discussions error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
  
  // GET /forum/user/replies - Réponses de l'utilisateur
  async getUserReplies(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 10;
      
      const replies = await forumService.getUserReplies(userId, limit);
      
      res.json({
        success: true,
        data: replies
      });
    } catch (error) {
      console.error('❌ Get user replies error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new ForumController();



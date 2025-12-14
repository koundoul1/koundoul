import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

class ForumService {
  
  /**
   * Créer une discussion
   */
  async createDiscussion(userId, data) {
    const discussion = await prisma.discussion.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        category: data.category || 'QUESTION',
        lessonId: data.lessonId,
        exerciseId: data.exerciseId,
        subjectId: data.subjectId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        lesson: true,
        exercise: true,
        subject: true
      }
    });
    
    return discussion;
  }
  
  /**
   * Récupérer toutes les discussions (avec filtres et pagination)
   */
  async getDiscussions(filters = {}, page = 1, limit = 20) {
    const where = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }
    
    if (filters.lessonId) {
      where.lessonId = filters.lessonId;
    }
    
    if (filters.solved !== undefined) {
      where.solved = filters.solved === 'true';
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          lesson: { select: { id: true, title: true } },
          exercise: { select: { id: true, title: true } },
          subject: { select: { id: true, name: true, icon: true } },
          replies: {
            select: { id: true },
            take: 1
          },
          _count: {
            select: {
              replies: true,
              votes: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.discussion.count({ where })
    ]);
    
    return {
      discussions: discussions.map(d => ({
        ...d,
        repliesCount: d._count.replies,
        votesCount: d._count.votes
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Récupérer une discussion avec ses réponses
   */
  async getDiscussionById(discussionId, userId = null) {
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        lesson: true,
        exercise: true,
        subject: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            _count: {
              select: { votes: true }
            }
          },
          orderBy: [
            { isBestAnswer: 'desc' },
            { upvotes: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: {
            replies: true,
            votes: true
          }
        }
      }
    });
    
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    // Incrémenter les vues
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { views: { increment: 1 } }
    });
    
    // Vérifier si l'utilisateur a voté
    if (userId) {
      const userVote = await prisma.discussionVote.findUnique({
        where: {
          discussionId_userId: {
            discussionId,
            userId
          }
        }
      });
      
      discussion.userVote = userVote?.value || 0;
    }
    
    return {
      ...discussion,
      repliesCount: discussion._count.replies,
      votesCount: discussion._count.votes
    };
  }
  
  /**
   * Créer une réponse
   */
  async createReply(userId, discussionId, content) {
    const reply = await prisma.reply.create({
      data: {
        userId,
        discussionId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
    
    return reply;
  }
  
  /**
   * Voter pour une discussion
   */
  async voteDiscussion(userId, discussionId, value) {
    // value: +1 (upvote) ou -1 (downvote)
    if (value !== 1 && value !== -1) {
      throw new Error('Vote value must be +1 or -1');
    }
    
    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.discussionVote.findUnique({
      where: {
        discussionId_userId: {
          discussionId,
          userId
        }
      }
    });
    
    let newUpvotes;
    
    if (existingVote) {
      // Si même vote, supprimer
      if (existingVote.value === value) {
        await prisma.discussionVote.delete({
          where: {
            discussionId_userId: {
              discussionId,
              userId
            }
          }
        });
        
        newUpvotes = await prisma.discussion.update({
          where: { id: discussionId },
          data: { upvotes: { decrement: value } }
        });
      } else {
        // Changer le vote
        await prisma.discussionVote.update({
          where: {
            discussionId_userId: {
              discussionId,
              userId
            }
          },
          data: { value }
        });
        
        newUpvotes = await prisma.discussion.update({
          where: { id: discussionId },
          data: { upvotes: { increment: value * 2 } } // -1 -> +1 = +2
        });
      }
    } else {
      // Nouveau vote
      await prisma.discussionVote.create({
        data: {
          userId,
          discussionId,
          value
        }
      });
      
      newUpvotes = await prisma.discussion.update({
        where: { id: discussionId },
        data: { upvotes: { increment: value } }
      });
    }
    
    return { upvotes: newUpvotes.upvotes };
  }
  
  /**
   * Voter pour une réponse
   */
  async voteReply(userId, replyId, value) {
    if (value !== 1 && value !== -1) {
      throw new Error('Vote value must be +1 or -1');
    }
    
    const existingVote = await prisma.replyVote.findUnique({
      where: {
        replyId_userId: {
          replyId,
          userId
        }
      }
    });
    
    let newUpvotes;
    
    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.replyVote.delete({
          where: {
            replyId_userId: {
              replyId,
              userId
            }
          }
        });
        
        newUpvotes = await prisma.reply.update({
          where: { id: replyId },
          data: { upvotes: { decrement: value } }
        });
      } else {
        await prisma.replyVote.update({
          where: {
            replyId_userId: {
              replyId,
              userId
            }
          },
          data: { value }
        });
        
        newUpvotes = await prisma.reply.update({
          where: { id: replyId },
          data: { upvotes: { increment: value * 2 } }
        });
      }
    } else {
      await prisma.replyVote.create({
        data: {
          userId,
          replyId,
          value
        }
      });
      
      newUpvotes = await prisma.reply.update({
        where: { id: replyId },
        data: { upvotes: { increment: value } }
      });
    }
    
    return { upvotes: newUpvotes.upvotes };
  }
  
  /**
   * Marquer une réponse comme meilleure réponse
   */
  async markBestAnswer(userId, discussionId, replyId) {
    // Vérifier que l'utilisateur est l'auteur de la discussion
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    });
    
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    if (discussion.userId !== userId) {
      throw new Error('Only the discussion author can mark best answer');
    }
    
    // Retirer l'ancien best answer s'il existe
    await prisma.reply.updateMany({
      where: {
        discussionId,
        isBestAnswer: true
      },
      data: { isBestAnswer: false }
    });
    
    // Marquer la nouvelle meilleure réponse
    const reply = await prisma.reply.update({
      where: { id: replyId },
      data: { isBestAnswer: true }
    });
    
    // Marquer la discussion comme résolue
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { solved: true }
    });
    
    return reply;
  }
  
  /**
   * Récupérer les discussions d'un utilisateur
   */
  async getUserDiscussions(userId, limit = 10) {
    return await prisma.discussion.findMany({
      where: { userId },
      include: {
        subject: { select: { name: true, icon: true } },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
  
  /**
   * Récupérer les réponses d'un utilisateur
   */
  async getUserReplies(userId, limit = 10) {
    return await prisma.reply.findMany({
      where: { userId },
      include: {
        discussion: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export default new ForumService();



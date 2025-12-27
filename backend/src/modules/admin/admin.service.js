import prismaService from '../../database/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Service pour les fonctionnalités administrateur
 */
class AdminService {
  /**
   * Obtenir les statistiques générales
   */
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalSubscriptions,
        activeSubscriptions,
        totalPayments,
        revenue
      ] = await Promise.all([
        prismaService.client.user.count(),
        prismaService.client.user.count({ where: { isActive: true } }),
        prismaService.client.subscription.count(),
        prismaService.client.subscription.count({ where: { status: 'ACTIVE' } }),
        prismaService.client.payment.count({ where: { status: 'COMPLETED' } }),
        prismaService.client.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true }
        })
      ]);

      return {
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers
          },
          subscriptions: {
            total: totalSubscriptions,
            active: activeSubscriptions
          },
          payments: {
            total: totalPayments,
            revenue: revenue._sum.amount || 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting admin dashboard stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir tous les utilisateurs avec pagination
   */
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {};

      const [users, total] = await Promise.all([
        prismaService.client.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isAdmin: true,
            createdAt: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prismaService.client.user.count({ where })
      ]);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir tous les abonnements avec pagination
   */
  async getSubscriptions(page = 1, limit = 20, status = null) {
    try {
      const skip = (page - 1) * limit;
      const where = status ? { status } : {};

      const [subscriptions, total] = await Promise.all([
        prismaService.client.subscription.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true
              }
            },
            plan: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prismaService.client.subscription.count({ where })
      ]);

      return {
        success: true,
        data: {
          subscriptions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting subscriptions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir tous les paiements avec pagination
   */
  async getPayments(page = 1, limit = 20, status = null) {
    try {
      const skip = (page - 1) * limit;
      const where = status ? { status } : {};

      const [payments, total] = await Promise.all([
        prismaService.client.payment.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true
              }
            },
            subscription: {
              include: { plan: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prismaService.client.payment.count({ where })
      ]);

      return {
        success: true,
        data: {
          payments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting payments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour le statut d'un utilisateur (actif/inactif, admin)
   */
  async updateUserStatus(userId, data) {
    try {
      const user = await prismaService.client.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
          isAdmin: true
        }
      });

      return { success: true, data: user };
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir tous les plans d'abonnement
   */
  async getPlans() {
    try {
      const plans = await prismaService.client.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
      });

      return {
        success: true,
        data: plans
      };
    } catch (error) {
      console.error('❌ Error getting plans:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un nouveau plan d'abonnement
   */
  async createPlan(planData) {
    try {
      const { name, description, price, currency, duration, features, isActive } = planData;

      if (!name || price === undefined) {
        return { success: false, error: 'Nom et prix requis' };
      }

      const plan = await prismaService.client.subscriptionPlan.create({
        data: {
          name,
          description,
          price,
          currency: currency || 'xof',
          duration: duration || 30,
          features: features || {},
          isActive: isActive !== undefined ? isActive : true
        }
      });

      return { success: true, data: plan };
    } catch (error) {
      console.error('❌ Error creating plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour un plan d'abonnement
   */
  async updatePlan(planId, planData) {
    try {
      const plan = await prismaService.client.subscriptionPlan.update({
        where: { id: planId },
        data: planData
      });

      return { success: true, data: plan };
    } catch (error) {
      console.error('❌ Error updating plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un plan d'abonnement (soft delete en désactivant)
   */
  async deletePlan(planId) {
    try {
      // Vérifier s'il y a des abonnements actifs avec ce plan
      const activeSubscriptions = await prismaService.client.subscription.count({
        where: {
          planId,
          status: 'ACTIVE'
        }
      });

      if (activeSubscriptions > 0) {
        return { success: false, error: 'Impossible de supprimer un plan avec des abonnements actifs' };
      }

      // Désactiver le plan au lieu de le supprimer
      const plan = await prismaService.client.subscriptionPlan.update({
        where: { id: planId },
        data: { isActive: false }
      });

      return { success: true, data: plan };
    } catch (error) {
      console.error('❌ Error deleting plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un compte élève (par un parent ou admin)
   */
  async createStudentAccount(studentData) {
    try {
      const { email, username, password, firstName, lastName, parentId } = studentData;

      if (!email || !username || !password) {
        return { success: false, error: 'Email, nom d\'utilisateur et mot de passe requis' };
      }

      // Vérifier si l'utilisateur existe déjà
      const existing = await prismaService.client.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      });

      if (existing) {
        return { success: false, error: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà' };
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'élève
      const student = await prismaService.client.user.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
          xp: 0,
          level: 1,
          isActive: true,
          isAdmin: false
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      });

      // Si un parent est spécifié, créer le lien parent-enfant
      if (parentId) {
        await prismaService.client.parentChildLink.create({
          data: {
            parentId,
            childId: student.id,
            approved: true
          }
        });
      }

      return { success: true, data: student };
    } catch (error) {
      console.error('❌ Error creating student account:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les statistiques d'un élève
   */
  async getStudentStats(studentId) {
    try {
      const student = await prismaService.client.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          xp: true,
          level: true,
          streak: true,
          createdAt: true
        }
      });

      if (!student) {
        return { success: false, error: 'Élève non trouvé' };
      }

      // Calculer les statistiques
      const [
        lessonsCompleted,
        exercisesAttempted,
        exercisesCorrect,
        quizzesCompleted,
        badgesEarned,
        totalTimeSpent
      ] = await Promise.all([
        prismaService.client.lessonCompletion.count({
          where: { userId: studentId, completed: true }
        }),
        prismaService.client.exerciseAttempt.count({
          where: { userId: studentId }
        }),
        prismaService.client.exerciseAttempt.count({
          where: { userId: studentId, isCorrect: true }
        }),
        prismaService.client.quizAttempt.count({
          where: { userId: studentId, status: 'COMPLETED' }
        }),
        prismaService.client.userBadge.count({
          where: { userId: studentId }
        }),
        prismaService.client.lessonCompletion.aggregate({
          where: { userId: studentId },
          _sum: { timeSpent: true }
        })
      ]);

      const successRate = exercisesAttempted > 0 
        ? Math.round((exercisesCorrect / exercisesAttempted) * 100) 
        : 0;

      return {
        success: true,
        data: {
          student,
          stats: {
            lessonsCompleted,
            exercisesAttempted,
            exercisesCorrect,
            successRate,
            quizzesCompleted,
            badgesEarned,
            totalTimeSpent: Math.floor((totalTimeSpent._sum.timeSpent || 0) / 60) // en minutes
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting student stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AdminService();

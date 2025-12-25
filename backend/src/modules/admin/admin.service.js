import prismaService from '../../database/prisma.js';

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
}

export default new AdminService();

import { PrismaClient } from '@prisma/client'

class PrismaService {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    })
  }

  async connect() {
    try {
      await this.prisma.$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      process.exit(1)
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect()
      console.log('🔌 Database disconnected')
    } catch (error) {
      console.error('❌ Database disconnection failed:', error)
    }
  }

  get client() {
    return this.prisma
  }

  // Méthodes utilitaires
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
    }
  }

  // Méthodes pour les transactions
  async transaction(callback) {
    return await this.prisma.$transaction(callback)
  }

  // Méthodes pour les requêtes complexes
  async findUserWithStats(userId) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        problems: {
          select: {
            id: true,
            title: true,
            points: true,
            createdAt: true
          }
        },
        solutions: {
          select: {
            id: true,
            points: true,
            isCorrect: true,
            createdAt: true
          }
        },
        quizzes: {
          select: {
            id: true,
            score: true,
            completedAt: true,
            createdAt: true
          }
        },
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            problems: true,
            solutions: true,
            quizzes: true,
            badges: true
          }
        }
      }
    })
  }

  async findProblemsWithStats(filters = {}) {
    const { category, difficulty, subject, userId } = filters
    
    return await this.prisma.problem.findMany({
      where: {
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(subject && { subject }),
        ...(userId && { userId }),
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        solutions: {
          select: {
            id: true,
            isCorrect: true,
            points: true
          }
        },
        _count: {
          select: {
            solutions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findQuizzesWithStats(filters = {}) {
    const { category, difficulty, subject } = filters
    
    return await this.prisma.quiz.findMany({
      where: {
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(subject && { subject }),
        isActive: true
      },
      include: {
        attempts: {
          select: {
            id: true,
            score: true,
            completedAt: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Méthodes pour la gestion des utilisateurs
  async findUserById(userId) {
    return await this.prisma.user.findUnique({
      where: { id: userId }
    });
  }

  async findUserByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async updateUser(userId, updateData) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  async deleteUser(userId) {
    return await this.prisma.user.delete({
      where: { id: userId }
    });
  }
}

// Instance singleton
const prismaService = new PrismaService()

export default prismaService
export { PrismaClient }


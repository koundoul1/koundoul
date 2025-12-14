/**
 * ⚔️ Service Duels - KOUNDOUL
 * Gestion des duels entre utilisateurs
 */

import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

class DuelsService {
  /**
   * Récupérer tous les duels disponibles pour un utilisateur
   */
  async getAvailableDuels(userId) {
    try {
      const duels = await prisma.duel.findMany({
        where: {
          OR: [
            { challengerId: userId },
            { opponentId: userId }
          ],
          status: {
            in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
          }
        },
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true
            }
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true
            }
          },
          subject: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      return duels.map(duel => ({
        ...duel,
        opponent: duel.challengerId === userId ? duel.opponent : duel.challenger,
        isChallenger: duel.challengerId === userId
      }));
    } catch (error) {
      console.error('❌ Erreur getAvailableDuels:', error);
      throw error;
    }
  }

  /**
   * Récupérer les duels publics disponibles (pour trouver des adversaires)
   */
  async getPublicDuels(userId, filters = {}) {
    try {
      const { subjectId, difficulty } = filters;

      // Récupérer les duels en attente d'adversaire
      const duels = await prisma.duel.findMany({
        where: {
          status: 'PENDING',
          opponentId: {
            not: userId // Ne pas inclure les duels où l'utilisateur est déjà l'adversaire
          },
          ...(subjectId && { subjectId }),
          ...(difficulty && { difficulty })
        },
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true
            }
          },
          subject: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      return duels;
    } catch (error) {
      console.error('❌ Erreur getPublicDuels:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau duel
   */
  async createDuel(challengerId, data) {
    try {
      const {
        opponentId,
        subjectId,
        difficulty,
        questions,
        timeLimit
      } = data;

      // Vérifier que l'adversaire existe
      if (opponentId) {
        const opponent = await prisma.user.findUnique({
          where: { id: opponentId }
        });

        if (!opponent) {
          throw new Error('Adversaire non trouvé');
        }

        if (opponentId === challengerId) {
          throw new Error('Vous ne pouvez pas vous défier vous-même');
        }
      }

      const duel = await prisma.duel.create({
        data: {
          challengerId,
          opponentId: opponentId || challengerId, // Si pas d'adversaire, sera mis à jour lors de l'acceptation
          subjectId,
          difficulty: difficulty || 'MOYEN',
          questions: questions || 5,
          timeLimit: timeLimit || 10,
          status: opponentId ? 'PENDING' : 'PENDING',
          xpReward: 50
        },
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          subject: true
        }
      });

      return duel;
    } catch (error) {
      console.error('❌ Erreur createDuel:', error);
      throw error;
    }
  }

  /**
   * Accepter un duel
   */
  async acceptDuel(duelId, opponentId) {
    try {
      const duel = await prisma.duel.findUnique({
        where: { id: duelId }
      });

      if (!duel) {
        throw new Error('Duel non trouvé');
      }

      if (duel.status !== 'PENDING') {
        throw new Error('Ce duel ne peut plus être accepté');
      }

      // Mettre à jour le duel
      const updatedDuel = await prisma.duel.update({
        where: { id: duelId },
        data: {
          opponentId,
          status: 'ACCEPTED',
          acceptedAt: new Date()
        },
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          subject: true
        }
      });

      return updatedDuel;
    } catch (error) {
      console.error('❌ Erreur acceptDuel:', error);
      throw error;
    }
  }

  /**
   * Démarrer un duel (créer les quiz attempts)
   */
  async startDuel(duelId, userId) {
    try {
      const duel = await prisma.duel.findUnique({
        where: { id: duelId },
        include: {
          challenger: true,
          opponent: true
        }
      });

      if (!duel) {
        throw new Error('Duel non trouvé');
      }

      if (duel.status !== 'ACCEPTED') {
        throw new Error('Ce duel doit être accepté avant de commencer');
      }

      // Vérifier que l'utilisateur est un participant
      if (duel.challengerId !== userId && duel.opponentId !== userId) {
        throw new Error('Vous n\'êtes pas un participant de ce duel');
      }

      // Mettre à jour le statut
      const updatedDuel = await prisma.duel.update({
        where: { id: duelId },
        data: {
          status: 'IN_PROGRESS'
        }
      });

      return {
        duel: updatedDuel,
        isChallenger: duel.challengerId === userId
      };
    } catch (error) {
      console.error('❌ Erreur startDuel:', error);
      throw error;
    }
  }

  /**
   * Soumettre les résultats d'un duel
   */
  async submitDuel(duelId, userId, quizAttemptId, score) {
    try {
      const duel = await prisma.duel.findUnique({
        where: { id: duelId }
      });

      if (!duel) {
        throw new Error('Duel non trouvé');
      }

      if (duel.status !== 'IN_PROGRESS') {
        throw new Error('Ce duel n\'est pas en cours');
      }

      const isChallenger = duel.challengerId === userId;
      const updateData = {};

      if (isChallenger) {
        updateData.challengerScore = score;
        updateData.challengerQuizAttemptId = quizAttemptId;
      } else {
        updateData.opponentScore = score;
        updateData.opponentQuizAttemptId = quizAttemptId;
      }

      // Vérifier si les deux participants ont complété
      const bothCompleted = 
        (isChallenger && duel.opponentScore !== null) ||
        (!isChallenger && duel.challengerScore !== null);

      if (bothCompleted) {
        // Déterminer le gagnant
        const challengerScore = isChallenger ? score : duel.challengerScore;
        const opponentScore = isChallenger ? duel.opponentScore : score;
        
        let winnerId = null;
        if (challengerScore > opponentScore) {
          winnerId = duel.challengerId;
        } else if (opponentScore > challengerScore) {
          winnerId = duel.opponentId;
        }
        // En cas d'égalité, pas de gagnant

        updateData.status = 'COMPLETED';
        updateData.winnerId = winnerId;
        updateData.completedAt = new Date();

        // Attribuer les récompenses
        if (winnerId) {
          await prisma.user.update({
            where: { id: winnerId },
            data: {
              xp: {
                increment: duel.xpReward
              }
            }
          });
        }
      }

      const updatedDuel = await prisma.duel.update({
        where: { id: duelId },
        data: updateData,
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          winner: {
            select: {
              id: true,
              username: true
            }
          },
          subject: true
        }
      });

      return updatedDuel;
    } catch (error) {
      console.error('❌ Erreur submitDuel:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des duels d'un utilisateur
   */
  async getDuelHistory(userId) {
    try {
      const duels = await prisma.duel.findMany({
        where: {
          OR: [
            { challengerId: userId },
            { opponentId: userId }
          ],
          status: 'COMPLETED'
        },
        include: {
          challenger: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          opponent: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          winner: {
            select: {
              id: true,
              username: true
            }
          },
          subject: true
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: 50
      });

      return duels.map(duel => ({
        ...duel,
        isWinner: duel.winnerId === userId,
        opponent: duel.challengerId === userId ? duel.opponent : duel.challenger,
        myScore: duel.challengerId === userId ? duel.challengerScore : duel.opponentScore,
        opponentScore: duel.challengerId === userId ? duel.opponentScore : duel.challengerScore
      }));
    } catch (error) {
      console.error('❌ Erreur getDuelHistory:', error);
      throw error;
    }
  }
}

export default new DuelsService();








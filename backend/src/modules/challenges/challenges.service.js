/**
 * 🏆 Service Challenges - KOUNDOUL
 * Gestion des challenges hebdomadaires
 */

import prismaService from '../../database/prisma.js';

const prisma = prismaService.client || prismaService;

class ChallengesService {
  /**
   * Récupérer tous les challenges actifs
   */
  async getActiveChallenges() {
    try {
      const challenges = await prisma.challenge.findMany({
        where: {
          isActive: true,
          endDate: {
            gte: new Date()
          }
        },
        include: {
          subject: true,
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          endDate: 'asc'
        }
      });

      return challenges.map(challenge => ({
        ...challenge,
        participants: challenge._count.participants
      }));
    } catch (error) {
      console.error('❌ Erreur getActiveChallenges:', error);
      throw error;
    }
  }

  /**
   * Récupérer un challenge par ID
   */
  async getChallengeById(challengeId) {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          subject: true,
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        }
      });

      if (!challenge) {
        throw new Error('Challenge non trouvé');
      }

      return {
        ...challenge,
        participants: challenge._count.participants
      };
    } catch (error) {
      console.error('❌ Erreur getChallengeById:', error);
      throw error;
    }
  }

  /**
   * Récupérer le challenge hebdomadaire actif
   */
  async getWeeklyChallenge() {
    try {
      const now = new Date();
      const challenge = await prisma.challenge.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          subject: true,
          quiz: true,
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!challenge) {
        // Retourner un challenge par défaut si aucun n'existe
        return null;
      }

      return {
        ...challenge,
        participants: challenge._count.participants
      };
    } catch (error) {
      console.error('❌ Erreur getWeeklyChallenge:', error);
      throw error;
    }
  }

  /**
   * Démarrer un challenge pour un utilisateur
   */
  async startChallenge(challengeId, userId) {
    try {
      // Vérifier que le challenge existe et est actif
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!challenge) {
        throw new Error('Challenge non trouvé');
      }

      if (!challenge.isActive) {
        throw new Error('Ce challenge n\'est plus actif');
      }

      const now = new Date();
      if (now < challenge.startDate || now > challenge.endDate) {
        throw new Error('Ce challenge n\'est pas encore disponible ou est terminé');
      }

      // Vérifier si l'utilisateur a déjà commencé ce challenge
      const existingParticipant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        }
      });

      if (existingParticipant) {
        // Si déjà complété, retourner l'info
        if (existingParticipant.status === 'COMPLETED') {
          throw new Error('Vous avez déjà complété ce challenge');
        }
        // Sinon, retourner la participation existante
        return {
          participant: existingParticipant,
          challenge,
          quiz: challenge.quiz
        };
      }

      // Créer une nouvelle participation
      const participant = await prisma.challengeParticipant.create({
        data: {
          challengeId,
          userId,
          status: 'IN_PROGRESS'
        }
      });

      return {
        participant,
        challenge,
        quiz: challenge.quiz
      };
    } catch (error) {
      console.error('❌ Erreur startChallenge:', error);
      throw error;
    }
  }

  /**
   * Soumettre les réponses d'un challenge
   */
  async submitChallenge(challengeId, userId, quizAttemptId, score, correctAnswers, timeSpent) {
    try {
      const participant = await prismaService.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        },
        include: {
          challenge: true
        }
      });

      if (!participant) {
        throw new Error('Participation non trouvée');
      }

      // Mettre à jour la participation
      const updatedParticipant = await prisma.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          status: 'COMPLETED',
          score,
          correctAnswers,
          timeSpent,
          completedAt: new Date(),
          quizAttemptId
        }
      });

      // Attribuer les récompenses
      if (updatedParticipant.challenge.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: updatedParticipant.challenge.xpReward
            }
          }
        });
      }

      return updatedParticipant;
    } catch (error) {
      console.error('❌ Erreur submitChallenge:', error);
      throw error;
    }
  }

  /**
   * Récupérer le classement d'un challenge
   */
  async getLeaderboard(challengeId, scope = 'international') {
    try {
      const where = {
        challengeId,
        status: 'COMPLETED'
      };

      // Filtrer par scope si nécessaire
      let userWhere = {};
      const countryScopes = {
        'france': 'France',
        'senegal': 'Sénégal',
        'cote-ivoire': 'Côte d\'Ivoire',
        'mali': 'Mali',
        'burkina-faso': 'Burkina Faso',
        'niger': 'Niger',
        'togo': 'Togo',
        'benin': 'Bénin',
        'guinee': 'Guinée',
        'cameroun': 'Cameroun',
        'gabon': 'Gabon',
        'congo': 'Congo',
        'rdc': 'RDC',
        'madagascar': 'Madagascar',
        'mauritanie': 'Mauritanie',
        'tchad': 'Tchad',
        'tunisie': 'Tunisie',
        'maroc': 'Maroc',
        'algerie': 'Algérie',
        'belgique': 'Belgique',
        'suisse': 'Suisse',
        'canada': 'Canada'
      };

      if (scope === 'international') {
        // Pas de filtre, tous les pays
        userWhere = {};
      } else if (countryScopes[scope]) {
        // Filtre par pays spécifique
        userWhere = { country: countryScopes[scope] };
      } else if (scope === 'region') {
        // Pour l'instant, on ne filtre pas par région spécifique
        // À améliorer avec un paramètre de région
        userWhere = {};
      } else if (scope === 'school') {
        // À améliorer avec un paramètre d'école
        userWhere = {};
      }

      const participants = await prisma.challengeParticipant.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              school: true,
              region: true,
              country: true,
              level: true
            }
          }
        },
        orderBy: [
          { score: 'desc' },
          { timeSpent: 'asc' } // En cas d'égalité, le plus rapide gagne
        ],
        take: 500 // Prendre plus pour filtrer après
      });

      // Filtrer par pays si nécessaire et les participants qui ont un utilisateur
      let filteredParticipants = participants.filter(p => p.user !== null);
      
      if (Object.keys(userWhere).length > 0 && userWhere.country) {
        filteredParticipants = filteredParticipants.filter(
          p => p.user.country === userWhere.country
        );
      }
      
      // Limiter à 100 après filtrage
      filteredParticipants = filteredParticipants.slice(0, 100);

      return filteredParticipants.map((p, index) => ({
        rank: index + 1,
        userId: p.user.id,
        username: p.user.username ? `***${p.user.username.slice(0, 4)}***` : 'Anonyme',
        score: p.score || 0,
        level: this.getLevelLabel(p.user.level),
        school: p.user.school || 'Non renseigné',
        region: p.user.region || 'Non renseigné',
        country: p.user.country || 'Non renseigné'
      }));
    } catch (error) {
      console.error('❌ Erreur getLeaderboard:', error);
      throw error;
    }
  }

  /**
   * Récupérer la position d'un utilisateur dans le classement
   */
  async getUserRank(challengeId, userId, scope = 'international') {
    try {
      const leaderboard = await this.getLeaderboard(challengeId, scope);
      const userRank = leaderboard.findIndex(p => p.userId === userId);
      
      if (userRank === -1) {
        // L'utilisateur n'est pas dans le top 100, calculer sa position
        const participant = await prisma.challengeParticipant.findUnique({
          where: {
            challengeId_userId: {
              challengeId,
              userId
            }
          },
          include: {
            user: {
              select: {
                school: true,
                region: true,
                country: true
              }
            }
          }
        });

        if (!participant || participant.status !== 'COMPLETED') {
          return null;
        }

        // Compter combien de participants ont un meilleur score
        const betterCount = await prisma.challengeParticipant.count({
          where: {
            challengeId,
            status: 'COMPLETED',
            OR: [
              { score: { gt: participant.score || 0 } },
              {
                AND: [
                  { score: participant.score || 0 },
                  { timeSpent: { lt: participant.timeSpent || 0 } }
                ]
              }
            ]
          }
        });

        return {
          rank: betterCount + 1,
          score: participant.score || 0,
          school: participant.user.school,
          region: participant.user.region,
          country: participant.user.country
        };
      }

      return leaderboard[userRank];
    } catch (error) {
      console.error('❌ Erreur getUserRank:', error);
      throw error;
    }
  }

  /**
   * Convertir le niveau numérique en label
   */
  getLevelLabel(level) {
    const levels = {
      1: 'Débutant',
      2: 'Intermédiaire',
      3: 'Avancé',
      4: 'Expert',
      5: 'Maître'
    };
    return levels[level] || 'Débutant';
  }

  /**
   * Créer un challenge hebdomadaire (admin)
   */
  async createChallenge(data) {
    try {
      const {
        title,
        description,
        subjectId,
        difficulty,
        level,
        questions,
        timeLimit,
        startDate,
        endDate,
        xpReward,
        badgeReward,
        prize,
        quizId
      } = data;

      const challenge = await prisma.challenge.create({
        data: {
          title,
          description,
          subjectId,
          difficulty: difficulty || 'MOYEN',
          level: level || null,
          questions,
          timeLimit,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          xpReward: xpReward || 100,
          badgeReward,
          prize,
          quizId
        },
        include: {
          subject: true
        }
      });

      return challenge;
    } catch (error) {
      console.error('❌ Erreur createChallenge:', error);
      throw error;
    }
  }
}

export default new ChallengesService();


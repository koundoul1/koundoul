/**
 * 👤 Service Utilisateurs Koundoul
 * Gestion des profils utilisateurs et préférences
 */

import prismaService from '../../database/prisma.js';

class UsersService {
  /**
   * Récupérer le profil utilisateur complet
   */
  async getProfile(userId) {
    try {
      const user = await prismaService.findUserWithStats(userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return {
        success: true,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          level: user.level,
          xp: user.xp,
          preferences: user.preferences || {},
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      console.error('Erreur dans getProfile service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId, updateData) {
    try {
      const { firstName, lastName, email, preferences } = updateData;

      // Vérifier que l'utilisateur existe
      const existingUser = await prismaService.findUserById(userId);
      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier l'unicité de l'email si modifié
      if (email && email !== existingUser.email) {
        const emailExists = await prismaService.findUserByEmail(email);
        if (emailExists) {
          throw new Error('Cet email est déjà utilisé');
        }
      }

      // Préparer les données de mise à jour
      const updateFields = {};
      if (firstName !== undefined) updateFields.firstName = firstName;
      if (lastName !== undefined) updateFields.lastName = lastName;
      if (email !== undefined) updateFields.email = email.toLowerCase();
      if (preferences !== undefined) {
        updateFields.preferences = {
          ...existingUser.preferences,
          ...preferences
        };
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prismaService.updateUser(userId, updateFields);

      return {
        success: true,
        data: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          username: updatedUser.username,
          level: updatedUser.level,
          xp: updatedUser.xp,
          preferences: updatedUser.preferences || {},
          updatedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      console.error('Erreur dans updateProfile service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Récupérer l'utilisateur avec le mot de passe hashé
      const user = await prismaService.findUserById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe actuel
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Hasher le nouveau mot de passe
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le mot de passe
      await prismaService.updateUser(userId, { password: hashedNewPassword });

      return {
        success: true,
        message: 'Mot de passe changé avec succès'
      };
    } catch (error) {
      console.error('Erreur dans changePassword service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Supprimer le compte utilisateur
   */
  async deleteAccount(userId) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await prismaService.findUserById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Supprimer l'utilisateur (cascade supprimera les données liées)
      await prismaService.deleteUser(userId);

      return {
        success: true,
        message: 'Compte supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur dans deleteAccount service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new UsersService();


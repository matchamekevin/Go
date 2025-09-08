import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';
import { UserRepository } from './User.repository';

/**
 * Contrôleur pour la gestion des profils utilisateurs
 */
export class UserController {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /users/profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Utilisateur non authentifié' 
        });
      }

      const user = await UserRepository.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        });
      }

      // Retourner le profil sans le mot de passe
      return res.json({ 
        success: true, 
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isVerified: user.is_verified
        }
      });
    } catch (error) {
      console.error('Erreur getProfile:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur serveur lors de la récupération du profil' 
      });
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   * PUT /users/profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Utilisateur non authentifié' 
        });
      }

      const { name, phone } = req.body;

      // Validation des données
      if (!name && !phone) {
        return res.status(400).json({ 
          success: false, 
          error: 'Au moins un champ (nom ou téléphone) doit être fourni' 
        });
      }

      // Mise à jour du profil
      const updated = await UserRepository.updateProfile(userId, { name, phone });

      return res.json({ 
        success: true, 
        data: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          isVerified: updated.is_verified
        },
        message: 'Profil mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur serveur lors de la mise à jour du profil' 
      });
    }
  }
}

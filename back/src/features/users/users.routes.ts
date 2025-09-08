import { Router } from 'express';
import { UserController } from './User.controller';
import { authMiddleware } from '../../shared/midddleawers/auth.middleware';

const router = Router();

/**
 * Routes protégées pour la gestion des profils utilisateurs
 * Toutes les routes utilisent le middleware d'authentification
 */

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware as any);

// GET /users/profile - Récupérer le profil de l'utilisateur connecté
router.get('/profile', UserController.getProfile as any);

// PUT /users/profile - Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', UserController.updateProfile as any);

export default router;

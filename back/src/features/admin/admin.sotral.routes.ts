import { Router, Request, Response, NextFunction } from 'express';
import { adminSotralController } from './admin.sotral.controller';
import { authMiddleware, AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Middleware d'authentification admin
router.use((req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req as AuthenticatedRequest, res, next);
});

// ==========================================
// ROUTES POUR LA GESTION DES LIGNES
// ==========================================

// Récupérer toutes les lignes
router.get('/lines', adminSotralController.getAllLines);

// Créer une nouvelle ligne
router.post('/lines', adminSotralController.createLine);

// Mettre à jour une ligne
router.put('/lines/:id', adminSotralController.updateLine);

// Supprimer une ligne
router.delete('/lines/:id', adminSotralController.deleteLine);

// Activer/désactiver une ligne
router.post('/lines/:id/toggle-status', adminSotralController.toggleLineStatus);

// ==========================================
// ROUTES POUR LA GESTION DES ARRÊTS
// ==========================================

// Récupérer tous les arrêts
router.get('/stops', adminSotralController.getAllStops);

// Créer un nouvel arrêt
router.post('/stops', adminSotralController.createStop);

// ==========================================
// ROUTES POUR LA GESTION DES TYPES DE TICKETS
// ==========================================

// Récupérer tous les types de tickets
router.get('/ticket-types', adminSotralController.getTicketTypes);

// Créer un nouveau type de ticket
router.post('/ticket-types', adminSotralController.createTicketType);

// ==========================================
// ROUTES POUR LA GÉNÉRATION DE TICKETS
// ==========================================

// Générer des tickets pour une ligne spécifique
router.post('/generate-tickets', adminSotralController.generateTicketsForLine);

// Générer des tickets en masse pour toutes les lignes
router.post('/bulk-generate-tickets', adminSotralController.bulkGenerateTickets);

// ==========================================
// ROUTES POUR LES STATISTIQUES ET MONITORING
// ==========================================

// Statistiques du dashboard SOTRAL
router.get('/dashboard-stats', adminSotralController.getDashboardStats);

// Récupérer tous les tickets avec filtres
router.get('/tickets', adminSotralController.getAllTickets);

export default router;
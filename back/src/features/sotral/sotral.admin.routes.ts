import { Router } from 'express';
import { sotralController } from './sotral.controller';

const router = Router();

// ==========================================
// ROUTES ADMIN POUR SOTRAL
// ==========================================

// Statistiques et rapports
router.get('/stats', sotralController.getAdminStats.bind(sotralController));

// Gestion des tickets
router.get('/tickets', sotralController.getAllTicketsAdmin.bind(sotralController));
router.get('/users/:userId/tickets', sotralController.getUserTicketsAdmin.bind(sotralController));

// Informations complètes (mêmes que public mais pour admin)
router.get('/lines', sotralController.getAllLines.bind(sotralController));
router.get('/stops', sotralController.getAllStops.bind(sotralController));
router.get('/ticket-types', sotralController.getAllTicketTypes.bind(sotralController));

export { router as sotralAdminRoutes };
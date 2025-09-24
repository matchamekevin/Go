import { Router } from 'express';
import { sotralController } from './sotral.controller';
import { authMiddleware } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// ==========================================
// ROUTES PUBLIQUES POUR LE FRONT UTILISATEUR
// ==========================================

// Informations sur les lignes et arrêts
router.get('/lines', sotralController.getAllLines.bind(sotralController));
router.get('/lines/:id', sotralController.getLineById.bind(sotralController));
router.get('/lines/category/:categoryId', sotralController.getLinesByCategory.bind(sotralController));
router.get('/stops', sotralController.getAllStops.bind(sotralController));
router.get('/lines/:id/stops', sotralController.getStopsByLine.bind(sotralController));

// Types de tickets et tarification
router.get('/ticket-types', sotralController.getAllTicketTypes.bind(sotralController));
router.post('/calculate-price', sotralController.calculatePrice.bind(sotralController));

// Achat de tickets (authentification optionnelle pour l'instant)
router.post('/purchase', sotralController.purchaseTicket.bind(sotralController));
router.get('/my-tickets', authMiddleware as any, sotralController.getMyTickets);
router.delete('/my-tickets/:id', authMiddleware as any, sotralController.cancelUserTicket);

// Tickets générés par l'admin (publics pour le mobile)
router.get('/generated-tickets', sotralController.getGeneratedTickets.bind(sotralController));

// Gestion des tickets admin (privé)
router.delete('/tickets/:id', sotralController.deleteTicketAdmin.bind(sotralController));

// Health check
router.get('/health', sotralController.healthCheck.bind(sotralController));

// ==========================================
// ROUTES POUR L'APPLICATION SCANNER
// ==========================================

// Validation de tickets (pas d'auth pour permettre scan offline)
router.post('/validate-ticket', sotralController.validateTicket.bind(sotralController));
router.get('/ticket/:code', sotralController.getTicketByCode.bind(sotralController));

export { router as sotralRoutes };

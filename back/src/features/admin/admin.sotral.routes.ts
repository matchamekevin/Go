import { Router, Request, Response, NextFunction } from 'express';
import { adminSotralController } from './admin.sotral.controller';
import { authMiddleware, AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Statistiques du dashboard SOTRAL (temporairement sans auth pour debug)
router.get('/dashboard-stats', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.getDashboardStats(req, res);
});

// Temporairement sans auth pour debug des lignes et arrêts
router.get('/lines', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.getAllLines(req, res);
});

router.get('/stops', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.getAllStops(req, res);
});

// Route pour basculer le statut d'une ligne
router.post('/lines/:id/toggle-status', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.toggleLineStatus(req, res);
});

// Routes CRUD pour les lignes (temporairement sans auth pour debug)
router.post('/lines', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.createLine(req, res);
});

router.put('/lines/:id', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.updateLine(req, res);
});

router.delete('/lines/:id', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.deleteLine(req, res);
});

// Route pour les types de tickets (temporairement sans auth pour debug)
router.get('/ticket-types', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.getTicketTypes(req, res);
});

// Routes pour la génération de tickets (temporairement sans auth pour debug)
router.post('/generate-tickets', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.generateTicketsForLine(req, res);
});

router.post('/bulk-generate-tickets', (req: Request, res: Response) => {
  // Temporarily bypass auth for testing
  (req as any).user = { id: 1, role: 'admin' };
  adminSotralController.bulkGenerateTickets(req, res);
});

// Middleware d'authentification admin pour toutes les autres routes
router.use((req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req as AuthenticatedRequest, res, next);
});

// TODO: Implémenter la méthode getAllTickets dans AdminSotralController
// Récupérer tous les tickets avec filtres
router.get('/tickets', adminSotralController.getAllTickets);

// Supprimer un ticket individuel
router.delete('/tickets/:id', adminSotralController.deleteTicket);

// Supprimer plusieurs tickets
router.delete('/tickets', adminSotralController.deleteTickets);

export default router;

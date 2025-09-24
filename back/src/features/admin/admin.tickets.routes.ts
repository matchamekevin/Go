import { Router } from 'express';
import { AdminTicketsController } from './admin.tickets.controller';
import { authMiddleware } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Toutes les routes admin nécessitent une authentification
router.use(authMiddleware as any);

// Routes pour les produits de tickets
router.post('/products', AdminTicketsController.createProduct);
router.put('/products/:id', AdminTicketsController.updateProduct);
router.delete('/products/:id', AdminTicketsController.deleteProduct);

// Routes pour les trajets
router.post('/routes', AdminTicketsController.createRoute);
router.put('/routes/:id', AdminTicketsController.updateRoute);
router.delete('/routes/:id', AdminTicketsController.deleteRoute);

// Routes pour les tickets
router.get('/tickets', AdminTicketsController.getAllTickets);
router.patch('/tickets/:id/status', AdminTicketsController.updateTicketStatus);
// Suppression en masse de tickets
router.delete('/', AdminTicketsController.deleteTickets);

export default router;
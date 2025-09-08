import { Router } from 'express';
// Make sure the file exists at the specified path, or update the path if needed
import { AdminController } from './Admin.controller';
import { authMiddleware, AuthenticatedRequest } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Middleware pour vérifier que l'utilisateur est admin
const adminMiddleware = (req: AuthenticatedRequest, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Accès admin requis' });
  }
  next();
};

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware as any);
router.use(adminMiddleware);

// Routes pour la gestion des utilisateurs
router.get('/users/stats', AdminController.getUserStats as any);
router.get('/users', AdminController.getAllUsers as any);
router.get('/users/:id', AdminController.getUserById as any);
router.put('/users/:id', AdminController.updateUser as any);
router.delete('/users/:id', AdminController.deleteUser as any);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus as any);

// Routes pour la gestion des routes de transport
router.get('/routes/stats', AdminController.getRouteStats as any);
router.get('/routes', AdminController.getAllRoutes as any);
router.post('/routes', AdminController.createRoute as any);
router.put('/routes/:id', AdminController.updateRoute as any);
router.delete('/routes/:id', AdminController.deleteRoute as any);

// Routes pour la gestion des produits de tickets
router.get('/products', AdminController.getAllProducts as any);
router.post('/products', AdminController.createProduct as any);
router.put('/products/:id', AdminController.updateProduct as any);
router.delete('/products/:id', AdminController.deleteProduct as any);

// Routes pour les statistiques globales
router.get('/dashboard/stats', AdminController.getDashboardStats as any);

// Routes pour les paiements
router.get('/payments/stats', AdminController.getPaymentStats as any);
router.get('/payments', AdminController.getAllPayments as any);

export default router;

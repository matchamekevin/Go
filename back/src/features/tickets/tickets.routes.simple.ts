import { Router } from 'express';
import QRCode from 'qrcode';
import { TicketRepository } from './Ticket.repository';
import { TicketController } from './Ticket.controller';
import { authMiddleware } from '../../shared/midddleawers/auth.middleware';

const router = Router();

// Route pour obtenir tous les produits de tickets
router.get('/products', async (req, res) => {
  try {
    const products = await TicketRepository.getAllProducts();
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('[TicketsRoutes.getAllProducts] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des produits' });
  }
});

// Route pour obtenir tous les trajets
router.get('/routes', async (req, res) => {
  try {
    const routes = await TicketRepository.getAllRoutes();
    return res.status(200).json({ success: true, data: routes });
  } catch (error) {
    console.error('[TicketsRoutes.getAllRoutes] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des trajets' });
  }
});

// Route pour obtenir les trajets par catégorie de prix
router.get('/routes/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category || !['T100', 'T150', 'T200', 'T250', 'T300'].includes(category)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Catégorie de prix invalide. Utilisez T100, T150, T200, T250 ou T300.'
      });
    }
    
    const routes = await TicketRepository.getRoutesByPriceCategory(category);
    return res.status(200).json({ success: true, data: routes });
  } catch (error) {
    console.error('[TicketsRoutes.getRoutesByPriceCategory] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des trajets' });
  }
});

// Route de test (publique) pour récupérer les tickets d'un utilisateur par son id
// À n'utiliser qu'en développement
router.get('/user/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'user id invalide' });
    }
    const tickets = await TicketRepository.getTicketsByUserId(id);
    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('[TicketsRoutes.getUserTicketsTest] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tickets' });
  }
});

// Récupérer l'image PNG du QR code d'un ticket par son code
router.get('/:code/qrcode', async (req, res) => {
  try {
    const { code } = req.params;
    const ticket = await TicketRepository.getTicketByCode(code);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket introuvable' });
    }

    // Préférer le payload stocké en metadata, sinon en reconstruire un minimal
    const qrPayload = (ticket as any)?.metadata?.qr || {
      type: 'ticket',
      code: ticket.code,
      user_id: ticket.user_id,
      product_code: ticket.product_code,
      route_code: ticket.route_code || null,
      issued_at: ticket.purchased_at
    };

    const buffer = await QRCode.toBuffer(JSON.stringify(qrPayload), { type: 'png', scale: 6 });
    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[TicketsRoutes.qrcode] error:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la génération du QR code' });
  }
});

// Routes authentifiées
router.use(authMiddleware as any);

// Acheter un ticket (nécessite une authentification)
router.post('/purchase', TicketController.purchaseTicket);

// Mes tickets (nécessite une authentification)
router.get('/my-tickets', TicketController.getUserTickets);

// Valider un ticket (nécessite une authentification)
router.post('/validate', TicketController.validateTicket);

// Statistiques des tickets (admin)
router.get('/stats', TicketController.getTicketStats);

export default router;
